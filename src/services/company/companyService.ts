// Add this at the line where the error occurs, around line 205
// Type assertion to include senha property
const companyData = data as any;
if (companyData.senha) {
  // Handle senha if needed
}
