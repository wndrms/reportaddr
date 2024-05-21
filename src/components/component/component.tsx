'use client';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import saveToNeo4j from "@/utils/neo4j"
import Web3 from 'web3';
import { isAddress } from 'web3-validator';

const web3 = new Web3("http://localhost:8545")

export default function Component() {
  const [address, setAddress] = useState<string>("");
  const [startBlock, setStartBlock] = useState<number>(0);
  const [endBlock, setEndBlock] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSubmit = async () => {
    try {
      if (!isAddress(address)) {
        setError("Invalid Ethereum address");
        setSuccessMessage('');
        return;
      }
      if (startBlock < 0 || endBlock < 0) {
        setError("Block numbers must be positive");
        setSuccessMessage('');
        return;
      }
      if (startBlock > endBlock) {
        setError("Start block must be less than end block");
        setSuccessMessage('');
        return;
      }
      const currentBlock = await web3.eth.getBlockNumber();
      if (endBlock === 0 || endBlock > currentBlock) {
        setEndBlock(parseInt(currentBlock.toString(), 10));
      }
      const successMessage = await saveToNeo4j(address, startBlock, endBlock);
      setSuccessMessage(successMessage);
      setError('');
    } catch (error) {
      console.error("Error saving data to Neo4j", error);
      setError("Error saving data to Neo4j");
      setSuccessMessage('');
    }
  };

  return (
    <div key="1" className="flex items-center justify-center min-h-screen flex-col space-y-4">
      <div className="max-w-sm w-full space-y-2">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">SPAI Ethereum Wallet Tracker</h1>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter Ethereum Wallet</p>
          <Input 
            id="address" 
            placeholder="0xabcd..." 
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)} 
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Label className="mr-4" htmlFor="start-block">
                Start Block
              </Label>
              <Input 
                id="start-block" 
                placeholder="0" 
                type="number"
                value={startBlock}
                onChange={(e) => setStartBlock(Number(e.target.value))} 
              />
            </div>
            <div className="flex items-center">
              <Label className="mr-4" htmlFor="end-block">
                End Block
              </Label>
              <Input 
                id="end-block" 
                placeholder="latest" 
                type="number"
                value={endBlock}
                onChange={(e) => setEndBlock(Number(e.target.value))} />
            </div>
          </div>
          {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
          {successMessage && <p className="text-green-500 dark:text-green-400">{successMessage}</p>}
        </div>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  )
}
