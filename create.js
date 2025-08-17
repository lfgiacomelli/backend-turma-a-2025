import bcrypt from "bcrypt";

async function gerarHash() {
  const senha = "123456";
  const saltRounds = 10; // força do hash

  try {
    const hash = await bcrypt.hash(senha, saltRounds);
    console.log("Senha criptografada:", hash);
  } catch (erro) {
    console.error("Erro ao gerar hash:", erro);
  }
}

gerarHash();
