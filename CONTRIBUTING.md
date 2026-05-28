# Contribuindo para o Helena Semantic Studio

Obrigado por considerar contribuir para o Helena Semantic Studio! Este documento fornece diretrizes para ajudar você a contribuir de forma eficaz.

## Como Contribuir

### 1. Reportando Bugs

Se você encontrar um bug, por favor, abra uma issue no GitHub. Certifique-se de incluir:

*   Uma descrição clara e concisa do problema.
*   Passos para reproduzir o bug.
*   O comportamento esperado e o comportamento atual.
*   Informações sobre o seu ambiente (sistema operacional, versão do Node.js, navegador, etc.).

### 2. Sugerindo Melhorias

Se você tem uma ideia para uma nova funcionalidade ou uma melhoria, abra uma issue descrevendo sua proposta. Explique por que a funcionalidade seria útil e como ela se encaixa no objetivo do projeto.

### 3. Enviando Pull Requests

Se você deseja corrigir um bug ou implementar uma nova funcionalidade, siga estes passos:

1.  Faça um fork do repositório.
2.  Crie uma branch para a sua feature ou correção (`git checkout -b feature/minha-nova-feature` ou `git checkout -b fix/meu-bug-fix`).
3.  Faça as alterações necessárias no código.
4.  Certifique-se de que o código segue os padrões de estilo do projeto (use `npm run lint` se disponível).
5.  Escreva testes para as suas alterações, se aplicável.
6.  Faça o commit das suas alterações com mensagens claras e descritivas (`git commit -m 'feat: adiciona nova funcionalidade X'`).
7.  Faça o push para a sua branch (`git push origin feature/minha-nova-feature`).
8.  Abra um Pull Request no repositório original.

## Padrões de Código

*   **Backend**: Siga as convenções do TypeScript e do Fastify. Mantenha a estrutura modular (routes, controllers, services, repositories).
*   **Frontend**: Siga as convenções do Next.js e do React. Utilize os componentes do `shadcn/ui` e o Tailwind CSS para estilização.
*   **Idioma**: O código (variáveis, funções, classes) deve ser escrito em inglês. A interface do usuário e as mensagens de erro visíveis para o usuário devem ser em português brasileiro.

## Configuração do Ambiente de Desenvolvimento

Consulte o `README.md` para obter instruções detalhadas sobre como configurar o ambiente de desenvolvimento local, incluindo a inicialização do banco de dados com Docker Compose e a execução do backend e frontend.

## Dúvidas?

Se você tiver alguma dúvida sobre como contribuir, sinta-se à vontade para abrir uma issue com a tag `question` ou entrar em contato com os mantenedores do projeto.

Agradecemos sua contribuição!
