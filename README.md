# Front-end Administrativo de Rastreamento e Gestão

Este é o front-end administrativo do sistema de rastreamento e gestão de entregas. Ele é responsável por todas as operações de CRUD no sistema e pelo rastreamento em tempo real de motoristas e suas rotas. O front-end foi desenvolvido utilizando [Next.js](https://nextjs.org/).

## Pré-requisitos

Antes de iniciar o projeto, você precisa configurar algumas variáveis de ambiente que são essenciais para o funcionamento do sistema.

### Variáveis de Ambiente Necessárias

- `NEXT_PUBLIC_API_URL`: URL da API que o aplicativo utilizará para comunicação com o backend.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Chave de API para o Google Maps.

### Como Configurar as Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto.
2. Adicione as seguintes linhas ao arquivo `.env.local` com os valores apropriados:

    ```plaintext
    NEXT_PUBLIC_API_URL="YOUR API URL"
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR GOOGLE APIKEY"
    ```

3. Substitua `YOUR API URL` com a URL da sua API e `YOUR GOOGLE APIKEY` com a chave de API do Google Maps.

## Instalação

Siga os passos abaixo para configurar e executar o front-end localmente.

1. Clone o repositório:

    ```bash
    git clone https://github.com/Track-Trace-TCC/front-end-admin
    cd front-end-admin
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Execute o projeto:

    ```bash
    npm run dev
    ```

4. Abra o navegador e acesse `http://localhost:3000` para ver o aplicativo em ação.

## Funcionalidades

- CRUD de motoristas, administradores, pacotes, clientes e rotas.
- Rastreamento em tempo real de motoristas e suas rotas utilizando a API do Google Maps.
- Interface intuitiva e responsiva para facilitar a gestão do sistema.

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Google Maps API](https://developers.google.com/maps/documentation/javascript/overview)

## Contribuição

Se você deseja contribuir com este projeto, siga os passos abaixo:

1. Faça um fork do projeto.
2. Crie uma nova branch (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -am 'Adicione uma nova feature'`).
4. Faça o push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Contato

Se você tiver alguma dúvida ou sugestão, sinta-se à vontade para entrar em contato:

- **Nome**: Vinícius
- **Email**: viniciusataides@gmail.com
- **GitHub**: [github.com/Track-Trace-TCC](https://github.com/Track-Trace-TCC)