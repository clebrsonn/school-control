# Test Scenarios for School Control Application

This document outlines the test scenarios created for various components of the School Control application.

## Hooks

### usePagination Hook

- **Initialization Tests**
  - Should initialize with default values (page 0, size 10)
  - Should initialize with provided values

- **State Update Tests**
  - Should update currentPage when setCurrentPage is called
  - Should update pageSize when setPageSize is called
  - Should convert 1-based page to 0-based when handlePageChange is called

- **Empty Page Response Tests**
  - Should create an empty page response with current pagination state
  - Should reflect updated pagination state in the empty page response

## Services

### MonthlyFeeService

- **fetchMonthlyFeesByParentId Tests**
  - Should call get with the correct URL
  - Should propagate errors from the get function

- **fetchEnrollmentByStudent Tests**
  - Should call get with the correct URL
  - Should propagate errors from the get function

### EnrollmentService

- **enrollStudent Tests**
  - Should call post with the correct URL and data
  - Should propagate errors from the post function

- **getStudentEnrollments Tests**
  - Should call get with the correct URL
  - Should propagate errors from the get function

- **enrollStudentLegacy Tests**
  - Should call post with the correct URL and data
  - Should use default values for fees if not provided

- **cancelEnrollment Tests**
  - Should call get with the correct URL

- **renewEnrollment Tests**
  - Should call get with the correct URL

## React Components

### Details Components

#### ClassDetails Component

- **Rendering Tests**
  - Should render loading state initially
  - Should render class details when data is loaded

- **API Interaction Tests**
  - Should call getClassRoomById with the correct ID
  - Should handle error when fetching class data fails

#### ParentDetails Component

- **Rendering Tests**
  - Should render loading spinner when parent data is not available
  - Should render error message when there is an error
  - Should render parent details when data is loaded
  - Should render student list
  - Should render payments grouped by month

- **Interaction Tests**
  - Should handle marking a month as paid
  - Should handle error when marking a month as paid fails
  - Should open student form modal when "Adicionar Aluno" button is clicked

#### PaymentDetails Component

- **Rendering Tests**
  - Should render loading state initially
  - Should render payment details when data is loaded

- **API Interaction Tests**
  - Should call getPaymentById with the correct ID
  - Should handle error when fetching payment data fails

#### StudentDetails Component

- **Rendering Tests**
  - Should render loading state initially
  - Should render student details when data is loaded
  - Should render enrollment form when student has no enrollments
  - Should render current enrollment when student is enrolled

- **Interaction Tests**
  - Should handle enrollment when form is submitted
  - Should show error message when enrollment fails

## Manager Components

### ClassManager Component

- **Rendering Tests**
  - Should render the component with title
  - Should display class form fields

- **Interaction Tests**
  - Should handle adding a new class
  - Should handle deleting a class

- **Error Handling Tests**
  - Should display error message when fetching classes fails
  - Should display error message when adding a class fails

### DiscountManager Component

- **Rendering Tests**
  - Should render the component with title
  - Should display discount form fields

- **Interaction Tests**
  - Should handle adding a new discount
  - Should validate form fields before submission
  - Should handle deleting a discount

- **Error Handling Tests**
  - Should display error message when fetching discounts fails
  - Should display error message when adding a discount fails
  - Should display success message after adding a discount

### ParentManager Component

- **Rendering Tests**
  - Should render loading spinner initially
  - Should render the component with title after loading
  - Should display parent form fields

- **Interaction Tests**
  - Should handle adding a new parent
  - Should handle deleting a parent
  - Should reset form after successful parent creation

- **Error Handling Tests**
  - Should display error message when fetching parents fails
  - Should display error message when adding a parent fails

### PaymentManager Component

- **Rendering Tests**
  - Should render the component with title
  - Should display payments when data is available

- **Pagination Tests**
  - Should display pagination when there are multiple pages
  - Should not display pagination when there is only one page

- **Error Handling Tests**
  - Should display error message when there is an error

### StudentManager Component

- **Rendering Tests**
  - Should render the component with title
  - Should display student form fields
  - Should not display responsible field when responsible prop is provided

- **Data Fetching Tests**
  - Should fetch students for a specific responsible when responsible prop is provided
  - Should fetch all students when no responsible prop is provided

- **Interaction Tests**
  - Should handle adding a new student
  - Should handle editing a student
  - Should handle deleting a student

- **Error Handling Tests**
  - Should display error message when fetching students fails
  - Should display error message when adding a student fails

## Utility Functions

The application already had tests for utility functions, including:

- **capitalizeWords Tests**
  - Should capitalize the first letter of each word
  - Should handle empty strings
  - Should handle null or undefined values

- **truncateString Tests**
  - Should truncate strings longer than the specified length
  - Should handle empty strings
  - Should handle null or undefined values

## Running Tests

Tests can be run using the following npm scripts:

```bash
# Run all tests
pnpm --prefix front-end test

# Run tests in watch mode
pnpm --prefix front-end test:watch
```

## Test Coverage

The tests cover the following aspects of the application:

1. **Functionality**: Tests verify that components and functions work as expected.
2. **Error Handling**: Tests check that errors are properly caught and handled.
3. **Edge Cases**: Tests include scenarios for edge cases like empty values, null values, etc.
4. **User Interactions**: For UI components, tests simulate user interactions like form submissions.

## Future Test Improvements

Areas that could benefit from additional testing:

1. **Integration Tests**: Tests that verify multiple components work together correctly.
2. **End-to-End Tests**: Tests that simulate real user flows through the application.
3. **Performance Tests**: Tests that verify the application performs well under load.
