import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

const urlApi = "/api/v1/status";

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR(urlApi, fetchApi, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando.....";
  let versionPostgres = "Carregando...";
  let maxConnections = "Carregando...";
  let openedConnections = "Carregando....";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    versionPostgres = data.dependencies.database.version;
    maxConnections = data.dependencies.database.max_connections;
    openedConnections = data.dependencies.database.opened_connections;
  }

  return (
    <ul>
      <li>
        <b>Última atualização:</b> {updatedAtText}
      </li>
      <li>
        <b>Versão do Postgres:</b> {versionPostgres}
      </li>
      <li>
        <b>Limite de conexão:</b> {maxConnections}
      </li>
      <li>
        <b>Conexões abertas:</b> {openedConnections}
      </li>
    </ul>
  );
}
