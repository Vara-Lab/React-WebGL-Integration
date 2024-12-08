import { useAccount, useApi } from "@gear-js/react-hooks";
import { ApiLoader } from "@/components";
import { Header } from "@/components/layout";
import { withProviders } from "@/app/hocs";
import { useWalletSync } from "@/features/wallet/hooks";
import { Routing } from "./pages";
import { CONTRACT_DATA, sponsorName, sponsorMnemonic } from "./app/consts";
import "@gear-js/vara-ui/dist/style.css";
import { Box } from "@chakra-ui/react";

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  
  useWalletSync();

  const isAppReady = isApiReady && isAccountReady;

  // App with context
  return (
    <>
      <Box h="150px" w="100%"/>
      {isAppReady ? <Routing /> : <ApiLoader />}
      <iframe
        src="/unity/index.html"
        width="100%"
        height="600px"
        style={{ border: 'none' }}
        title="Unity WebGL"
      ></iframe>
    </>
  );
}

export const App = withProviders(Component);
