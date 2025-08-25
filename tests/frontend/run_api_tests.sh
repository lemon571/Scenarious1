#!/bin/bash

# API Test Runner Script
# This script runs all API tests for both backend and frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    if command_exists curl; then
        if curl -s --head "$url" >/dev/null 2>&1; then
            print_success "$service_name is running at $url"
            return 0
        else
            print_warning "$service_name is not running at $url"
            return 1
        fi
    else
        print_warning "curl not found, skipping $service_name check"
        return 1
    fi
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend API tests..."
    
    cd backend/scenariosus
    
    # Check if Python and pip are available
    if ! command_exists python3; then
        print_error "Python 3 is not installed"
        return 1
    fi
    
    if ! command_exists pip; then
        print_error "pip is not installed"
        return 1
    fi
    
    # Install test dependencies if requirements-test.txt exists
    if [ -f "tests/requirements-test.txt" ]; then
        print_status "Installing test dependencies..."
        pip install -r tests/requirements-test.txt
    fi
    
    # Run tests
    print_status "Running pytest..."
    if command_exists pytest; then
        pytest tests/test_api.py -v
        pytest tests/test_openapi_schema.py -v
    else
        print_error "pytest is not installed"
        return 1
    fi
    
    cd ../..
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend API tests..."
    
    cd frontend
    
    # Check if Node.js and npm are available
    if ! command_exists node; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        return 1
    fi
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi
    
    # Install Playwright if not already installed
    if ! command_exists npx; then
        print_error "npx is not available"
        return 1
    fi
    
    print_status "Installing Playwright..."
    npx playwright install --with-deps
    
    # Run tests
    print_status "Running Playwright tests..."
    npx playwright test tests/api.spec.ts
    
    cd ..
}

# Function to run all tests
run_all_tests() {
    print_status "Starting API test suite..."
    
    # Check if we're in the right directory
    if [ ! -f "openapi.yaml" ]; then
        print_error "openapi.yaml not found. Please run this script from the team-1 directory."
        exit 1
    fi
    
    # Check services
    print_status "Checking services..."
    check_service "http://localhost:8080" "Backend API" || print_warning "Backend service check failed"
    
    # Run backend tests
    if run_backend_tests; then
        print_success "Backend tests completed successfully"
    else
        print_error "Backend tests failed"
        BACKEND_FAILED=true
    fi
    
    # Run frontend tests
    if run_frontend_tests; then
        print_success "Frontend tests completed successfully"
    else
        print_error "Frontend tests failed"
        FRONTEND_FAILED=true
    fi
    
    # Summary
    echo ""
    print_status "Test Summary:"
    if [ "$BACKEND_FAILED" = true ]; then
        print_error "Backend tests: FAILED"
    else
        print_success "Backend tests: PASSED"
    fi
    
    if [ "$FRONTEND_FAILED" = true ]; then
        print_error "Frontend tests: FAILED"
    else
        print_success "Frontend tests: PASSED"
    fi
    
    if [ "$BACKEND_FAILED" = true ] || [ "$FRONTEND_FAILED" = true ]; then
        print_error "Some tests failed. Please check the output above."
        exit 1
    else
        print_success "All tests passed!"
    fi
}

# Function to show help
show_help() {
    echo "API Test Runner"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -b, --backend  Run only backend tests"
    echo "  -f, --frontend Run only frontend tests"
    echo "  -a, --all      Run all tests (default)"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all tests"
    echo "  $0 --backend    # Run only backend tests"
    echo "  $0 --frontend   # Run only frontend tests"
    echo ""
}

# Main script logic
case "${1:-all}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -b|--backend)
        print_status "Running backend tests only..."
        run_backend_tests
        ;;
    -f|--frontend)
        print_status "Running frontend tests only..."
        run_frontend_tests
        ;;
    -a|--all|all)
        run_all_tests
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
