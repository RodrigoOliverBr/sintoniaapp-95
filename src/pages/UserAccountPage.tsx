
// Around line 59-60, replace the spread operator with explicit property assignments
setUserProfile({
  nome: data?.nome || "",
  email: data?.email || "",
  telefone: data?.telefone || ""
});
