import { useEffect, useState } from 'react';
import './App.css';
import abi from './contracts/ABI.json';
import { ethers, providers } from 'ethers';

const address = "0xD5f3Ede108014bD489486f5Af987c0aFB99B180D";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transactionData, setTransactionData] = useState({});
  const [transactionStatus, setTransactionStatus] = useState(false);
  const [currContractName, setCurrContractName] = useState(null);
  const [currContractSymbol, setCurrContractSymbol] = useState(null);


  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('No metamask was found.');
      return;
    } else {
      console.log('Found a metamask, checking for an authorized accountccess...')

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Have an authorized account: ' + account)
        setCurrentAccount(account)
        getContractData();
      } else {
        console.log('Authorized account not found')
      }
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert('No metamask was found. Connect error');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Found account: ' + accounts[0]);
      setCurrentAccount(accounts[0]);
      getContractData();
    } catch (err) {
      console.log(err)
    }
  }

  const getContractData = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(address, abi, signer);
        console.log(contract)

        let contractName = await contract.name()
        let contractSymbol = await contract.symbol();

        localStorage.setItem('contractName', contractName);
        localStorage.setItem('contractSymbol', contractSymbol);

        setCurrContractName(contractName)
        setCurrContractSymbol(contractSymbol)

      } else {
        alert('No metamask was found. Connect error');
      }
    } catch (err) {

    }
  }

  const mintHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(address, abi, signer);
        let txn = await contract.mint();
        setTransactionStatus(true)
        console.log('The transaction is being processed')
        await txn.wait();
        console.log(txn);
        console.log('Transaction sent')
        setTransactionData(txn)
        setTransactionStatus(false)

      } else {
        alert('No metamask was found. Connect error');
      }
    } catch (err) {

    }
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='app'>

      <div className='headline'>
        <h1>Test App</h1>
      </div>

      <div className='siteBody'>
        {currentAccount === null
          ?
          <div>
            <button onClick={connectWalletHandler} className='buttons connectWalletButton'>
              Connect Wallet
            </button>
          </div>
          :
          <div className='bodyContent'>
            <div className='bodyContractData'>
              <span className='bodyTxt'>{currContractName} [ {currContractSymbol} ] </span>
              <span className='bodyTxt'>Contract address: {address}</span>
              <span className='bodyTxt'>My address: {currentAccount}</span>
            </div>
            <div className='bodyMint'>
              {transactionStatus
                ?
                <div>
                  <span>Transaction is being sent, please wait...</span>
                </div>
                :
                <div className='bodyMintData'>
                  <div>
                    <button onClick={mintHandler} className='buttons mintButton'>
                      Mint
                    </button>
                  </div>
                  {transactionData.from
                    ?
                    <div className='trxBlock'>
                      <div className='trxHeadline'>Transaction sent successfully</div>
                      <span className='bodyTxt'>From: {transactionData.from}</span>
                      <span className='bodyTxt'>To: {transactionData.to}</span>
                      <span className='bodyTxt'>Hash: {transactionData.hash}</span>
                      <div className='trxAction'>
                        <button onClick={setTransactionData} className='smButtons closeButton'>close</button>
                      </div>
                    </div>
                    :
                    null
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;