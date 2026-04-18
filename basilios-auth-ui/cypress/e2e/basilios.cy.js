const TOKEN_CLIENTE =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJjbGllbnRlQGJhc2lsaW9zLmNvbSIsInJvbGVzIjpbIlJPTEVfQ0xJRU5URSJdLCJleHAiOjk5OTk5OTk5OTl9.fake-signature";
const TOKEN_FUNCIONARIO =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJmdW5jQGJhc2lsaW9zLmNvbSIsInJvbGVzIjpbIlJPTEVfRlVOQ0lPTkFSSU8iXSwiZXhwIjo5OTk5OTk5OTl9.fake-signature";

// Helper: injeta token no localStorage sem passar pela tela de login
function loginComo(token) {
  cy.window().then((win) => {
    win.localStorage.setItem("auth_token", token);
  });
}

describe("Login", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/login");
  });

  it("exibe o formulário corretamente", () => {
    cy.get("h1").should("contain.text", "Login");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
  });

  it('botão "Entrar" fica desabilitado com campos vazios', () => {
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it('botão "Entrar" fica habilitado ao preencher e-mail e senha', () => {
    cy.get("#email").type("usuario@basilios.com");
    cy.get("#password").type("Senha@123");
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it('navega para /register ao clicar em "Cadastre-se"', () => {
    cy.contains("Cadastre-se").click();
    cy.url().should("include", "/register");
  });

  it('navega para /forgot-password ao clicar em "Esqueceu a senha?"', () => {
    cy.get("#email").type("usuario@basilios.com");
    cy.contains("Esqueceu a senha?").click();
    cy.url().should("include", "/forgot-password");
  });

  it("exibe erro ao entrar com credenciais inválidas", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { message: "Credenciais inválidas." },
    }).as("loginFail");

    cy.get("#email").type("errado@email.com");
    cy.get("#password").type("SenhaErrada@1");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginFail");
    cy.contains("Credenciais inválidas").should("be.visible");
  });

  it("redireciona para /home após login bem-sucedido", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: { token: TOKEN_CLIENTE },
    }).as("loginOk");

    cy.get("#email").type("cliente@basilios.com");
    cy.get("#password").type("Senha@123");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginOk");
    cy.url().should("include", "/home");
  });

  it("usuário já logado é redirecionado para /home ao visitar /login", () => {
    loginComo(TOKEN_CLIENTE);
    cy.visit("/login");
    cy.url().should("include", "/home");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Cadastro", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/register");
  });

  it("exibe todos os campos do formulário", () => {
    cy.get("h1").should("contain.text", "Cadastro");
    cy.get("#fullName").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirm").should("be.visible");
    cy.get("#cpf").should("be.visible");
    cy.get("#phone").should("be.visible");
  });

  it("exibe erro para e-mail inválido", () => {
    cy.get("#email").type("emailinvalido").blur();
    cy.contains("E-mail inválido").should("be.visible");
  });

  it("exibe erro para senha fraca", () => {
    cy.get("#password").type("senhasimples").blur();
    cy.contains("8+ caracteres com maiúscula").should("be.visible");
  });

  it("exibe erro quando as senhas não coincidem", () => {
    cy.get("#password").type("Senha@123");
    cy.get("#confirm").type("SenhaDiferente@1").blur();
    cy.contains("As senhas não coincidem").should("be.visible");
  });

  it("aplica máscara de CPF corretamente", () => {
    cy.get("#cpf").type("52998224725");
    cy.get("#cpf").should("have.value", "529.982.247-25");
  });

  it("aplica máscara de telefone celular corretamente", () => {
    cy.get("#phone").type("11987654321");
    cy.get("#phone").should("have.value", "(11) 98765-4321");
  });

  it("habilita o botão após preencher todos os campos válidos", () => {
    cy.get("#fullName").type("João da Silva");
    cy.get("#email").type("joao@basilios.com");
    cy.get("#password").type("Senha@123");
    cy.get("#confirm").type("Senha@123");
    cy.get("#cpf").type("52998224725");
    cy.get("#phone").type("11987654321");
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("exibe sucesso e vai para /login após cadastro", () => {
    cy.intercept("POST", "**/auth/register", {
      statusCode: 201,
      body: { message: "Usuário criado." },
    }).as("registerOk");

    cy.get("#fullName").type("João da Silva");
    cy.get("#email").type("joao@basilios.com");
    cy.get("#password").type("Senha@123");
    cy.get("#confirm").type("Senha@123");
    cy.get("#cpf").type("52998224725");
    cy.get("#phone").type("11987654321");
    cy.get('button[type="submit"]').click();

    cy.wait("@registerOk");
    cy.contains("Cadastro concluído").should("be.visible");
    cy.url().should("include", "/login");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Rotas protegidas", () => {
  beforeEach(() => cy.clearLocalStorage());

  it("/ redireciona para /home", () => {
    cy.visit("/");
    cy.url().should("include", "/home");
  });

  it("rota inexistente redireciona para /home", () => {
    cy.visit("/pagina-que-nao-existe");
    cy.url().should("include", "/home");
  });

  it("/profile bloqueia usuário sem login e manda para /login", () => {
    cy.visit("/profile");
    cy.url().should("include", "/login");
  });

  it("/checkout bloqueia usuário sem login e manda para /login", () => {
    cy.visit("/checkout");
    cy.url().should("include", "/login");
  });

  it("/dashboard bloqueia cliente (apenas funcionário) e manda para /login", () => {
    loginComo(TOKEN_CLIENTE);
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("/board bloqueia cliente (apenas funcionário) e manda para /login", () => {
    loginComo(TOKEN_CLIENTE);
    cy.visit("/board");
    cy.url().should("include", "/login");
  });

  it("/dashboard é acessível para funcionário", () => {
    loginComo(TOKEN_FUNCIONARIO);
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
  });

  it("/board é acessível para funcionário", () => {
    loginComo(TOKEN_FUNCIONARIO);
    cy.visit("/board");
    cy.url().should("include", "/board");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Home — Cardápio", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/produtos**", {
      statusCode: 200,
      body: [
        {
          id: 1,
          nome: "X-Basílios",
          preco: 35.9,
          descricao: "O clássico da casa",
        },
        {
          id: 2,
          nome: "X-Bacon",
          preco: 39.9,
          descricao: "Com bacon artesanal",
        },
      ],
    }).as("getProdutos");

    cy.visit("/home");
  });

  it("exibe os produtos após carregamento", () => {
    cy.wait("@getProdutos");
    cy.contains("X-Basílios").should("be.visible");
    cy.contains("X-Bacon").should("be.visible");
  });

  it("exibe mensagem quando o cardápio está vazio", () => {
    cy.intercept("GET", "**/produtos**", { statusCode: 200, body: [] }).as(
      "vazio",
    );
    cy.visit("/home");
    cy.wait("@vazio");
    cy.contains(/nenhum produto|cardápio vazio|sem produtos/i).should(
      "be.visible",
    );
  });
});
