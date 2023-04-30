package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
)

// ! This file should generate an executable in the root directory of the project called "run"
// to generate the executable run "go build ./run.go && mv ./run .." in this directory

/*
generic function for executing commands
*/
func execute(cmd *exec.Cmd) {
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Run()
	if err != nil {
		log.Fatal(err)
	}
}

/*
./run install
- Installs ay dependencies in userland
- Should exit 0 if successful
*/
func install() {
	// log.Println("Installing dependencies in userland...")
	// execute npm install from within the "module_registry" directory
	os.Chdir("module_registry")
	cmd := exec.Command("bash", "-c", "npm install > /dev/null 2>&1")
	execute(cmd)
	fmt.Println("Dependencies installed")

	os.Chdir("..")
	cmd = exec.Command("bash", "-c", "npm install > /dev/null 2>&1")
	execute(cmd)
	fmt.Println("Server Dependencies installed")
}

/*
./run build
- Compiles the node/TS cli
- Should exit 0 if successful
*/
func build() {
	// execute npm run build from within the "module_registry" directory
	os.Chdir("module_registry")
	cmd := exec.Command("bash", "-c", "npm run build > /dev/null 2>&1")
	execute(cmd)
	fmt.Println("CLI built")
	// maybe: move the built cli to the root directory of the project

	// move scripts into webpage directory
	os.Chdir("..")
	cmd = exec.Command("bash", "-c", "cp -a module_registry/out/ webpage/scripts/out")
	execute(cmd)
}

/*
./run test
- Runs the tests for the node/TS cli
- Should show total test count and number of tests passed
- Should show line coverage
*/
func test() {
	// log.Println("Testing CLI")
	// execute npm run test from within the "module_registry" directory
	os.Chdir("module_registry")
	// cmd := exec.Command("bash", "-c", "npm run test > /dev/null 2>&1")
	cmd := exec.Command("bash", "-c", "npm run test -- --silent=false")
	execute(cmd)

	error := false

	// parse numTotalTests and numPassedTests from /coverage/output-final.json
	if _, err := os.Stat("coverage/output-final.json"); err == nil {
		// file exists
		cmd := exec.Command("node", "-e", "console.log('Total: ' + JSON.parse(fs.readFileSync('coverage/output-final.json')).numTotalTests)")
		execute(cmd)
		cmd = exec.Command("node", "-e", "console.log('Passed: ' + JSON.parse(fs.readFileSync('coverage/output-final.json')).numPassedTests)")
		execute(cmd)
	} else {
		error = true
	}

	// get lineCoverage from /coverage/coverage-final.json
	if _, err := os.Stat("coverage/coverage-summary.json"); err == nil {
		// file exists
		cmd := exec.Command("node", "-e", "console.log('Coverage: ' + JSON.parse(fs.readFileSync('coverage/coverage-summary.json')).total.lines.pct + '%')")
		execute(cmd)
	} else {
		error = true
	}

	// if both files exist
	if !error {
		// print X/Y test cases passed. Z% line coverage achieved.
		cmd := exec.Command("node", "-e", "console.log(JSON.parse(fs.readFileSync('coverage/output-final.json')).numPassedTests + '/' + JSON.parse(fs.readFileSync('coverage/output-final.json')).numTotalTests + ' test cases passed. ' + JSON.parse(fs.readFileSync('coverage/coverage-summary.json')).total.lines.pct + '% line coverage achieved.')")
		execute(cmd)
	}
}

/*
./run URL_FILE
- Runs the CLI with the URL_FILE being the path to the file containing the URLs
- Should exit 0 if successful
- Should print all CLI output to stdout
*/
func run() {
	// log.Println("Running CLI")
	// execute the cli with the URL_FILE as the argument
	cmd := exec.Command("node", "module_registry/out/index.js", "-f", os.Args[1]) //nolint:gosec
	execute(cmd)
}

func server() {
	// run the server.js
	cmd := exec.Command("node", "webpage/server.js", "-f", os.Args[1]) //nolint:gosec
	execute(cmd)
}

func main() {

	if len(os.Args) < 2 {
		log.Fatal("Please provide a command")
	}

	switch os.Args[1] {
	case "install":
		install()
	case "build":
		build()
	case "test":
		test()
	case "server":
		server()
	default:
		// check if the argument is a file
		if _, err := os.Stat(os.Args[1]); err == nil {
			run()
		} else {
			log.Fatal("Please provide a valid command")
		}
	}
}
