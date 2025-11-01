import TransactionDetails from "@/components/Wallet/TransactionDetails";

const TransactionDetailsScreen = () => {
  return (
    <TransactionDetails
      type="retrait"
      transactionId="B#25133435"
      transactionType="Retrait"
      status="Complet"
      from="Portefeuille"
      to="OM (6 ** ** 27 22)"
      paymentMethod="Transfer Mobile"
      date="15 Septembre 2025"
      time="9:34"
      amount={500000}
      fees={0}
      totalAmount={500000}
    />
  );
};

export default TransactionDetailsScreen;
