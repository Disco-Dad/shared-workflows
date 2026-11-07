const want = "24.22.2";
if (process.versions.node !== want) {
  throw new Error(`expected Node ${want}, got ${process.versions.node}`);
}
console.log("node-fixture ok");
