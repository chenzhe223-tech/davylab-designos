import {loadAndCheckReceipt} from '../artifact-receipt.mjs';

const receiptPath=process.argv[2],file=process.argv[3];
if(!receiptPath){
 console.error('Usage: npm run verify:receipt -- <receipt.json> [video.mp4]');
 process.exit(2);
}
try{
 const result=await loadAndCheckReceipt(receiptPath,{file});
 console.log(JSON.stringify({receipt:receiptPath,...result},null,2));
}catch(error){
 console.error('RECEIPT VERIFICATION FAILED: '+error.message);
 process.exitCode=1;
}
