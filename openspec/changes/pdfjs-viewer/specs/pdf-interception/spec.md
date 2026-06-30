## ADDED Requirements

### Requirement: Redirect local PDF navigations to the viewer
The extension SHALL redirect main-frame navigations to local `file://` PDF URLs to the Margin viewer page, passing the original file URL as a parameter.

#### Scenario: Local PDF opens in Margin viewer
- **WHEN** the user navigates to a `file://…/document.pdf` URL
- **THEN** the browser lands on the Margin viewer page with the original file URL preserved as a parameter

#### Scenario: Original URL preserved
- **WHEN** the redirect occurs
- **THEN** the viewer can decode the exact original file URL from its parameters

### Requirement: No redirect loops
The redirection SHALL NOT re-trigger on the viewer page itself or on non-PDF requests.

#### Scenario: Viewer page is not re-redirected
- **WHEN** the viewer page (which references the original PDF URL) loads
- **THEN** the redirect rule does not match the viewer URL and no loop occurs

#### Scenario: Non-PDF navigation untouched
- **WHEN** the user navigates to a non-PDF URL
- **THEN** no redirect to the viewer occurs
