import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  UnorderedList,
  ListItem,
  Code,
} from "@chakra-ui/react";
import { walletConnectService } from "@/app/wallet-connect/controllers";
import { SignAndSendTransferService } from "@/app/wallet-connect/controllers";
import { ApiPromise, WsProvider } from "@polkadot/api";

function Landing() {
  const [connected, setConnected] = useState<boolean>(
    walletConnectService.isConnected()
  );
  const [accounts, setAccounts] = useState<any[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [programID, setProgramID] = useState<string>("");
  const [payloadProgram, setPayloadProgram] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [gasLimit, setGasLimit] = useState<number>(5000000);
  const [value, setValue] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [api, setApi] = useState<ApiPromise | null>(null);

  // Initialize API
  useEffect(() => {
    const initApi = async () => {
      const wsProvider = new WsProvider("wss://testnet.vara.network"); // Cambia por tu URL de WebSocket
      const apiInstance = await ApiPromise.create({ provider: wsProvider });
      setApi(apiInstance);
    };
    initApi();
  }, []);

  const handleConnectWallet = async () => {
    try {
      await walletConnectService.enableWalletConnect();
      setAccounts(walletConnectService.getAccounts());
      setConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet. Check console for more details.");
    }
  };

  const handleSignAndSendTransfer = async () => {
    if (!api || accounts.length === 0) {
      setError("API not ready or no accounts available.");
      return;
    }

    setError(null);
    setIsSigning(true);

    try {
      const transferService = new SignAndSendTransferService(api, true);
      const txId = await transferService.signAndSendTransfer(
        accounts,
        walletConnectService.signTransaction.bind(walletConnectService),
        recipient,
        Number(amount) * 1000000000000
      );

      setTxHash(txId);
    } catch (error: any) {
      console.error("Error sending transfer:", error);
      setError(error.message || "Failed to send transfer.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Box p={6} fontFamily="Arial, sans-serif">
      <Heading as="h1" size="xl" mb={4}>
        React + WebgL Template
      </Heading>
      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Error:</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}
      <VStack spacing={6} align="stretch">
        {!connected ? (
          <Button colorScheme="teal" size="lg" onClick={handleConnectWallet}>
            Connect Wallet
          </Button>
        ) : (
          <VStack spacing={4} align="stretch">
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Wallet connected successfully!
            </Alert>
            <Text fontWeight="bold">Accounts:</Text>
            <UnorderedList>
              {accounts.map((account, index) => (
                <ListItem key={index}>{account.address}</ListItem>
              ))}
            </UnorderedList>
            <HStack spacing={4}>
              <Button
                colorScheme="green"
                onClick={handleSignAndSendTransfer}
                isLoading={isSigning}
                loadingText="Sending Transfer..."
              >
                Sign and Send Transfer
              </Button>
            </HStack>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <Input
                placeholder="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </VStack>
          </VStack>
        )}
        {txHash && (
          <Box mt={6}>
            <Heading as="h3" size="md" mb={2}>
              Transaction Hash:
            </Heading>
            <Code>{txHash}</Code>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export { Landing };
