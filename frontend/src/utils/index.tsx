export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1e18).toFixed(4);
  return balance;
};

export const formatAddress = (addr: string) => {
  return `0x${addr.slice(2, 7).toUpperCase()}...${addr
    .slice(addr.length - 5)
    .toUpperCase()}`;
};

export const formatAddress_ = (addr: string) => {
  return `${addr.substring(0, 8)}...`;
};
