async function SetupDgraph(): Promise<boolean> {
  try {
    await setSchema();
    return true;
  } catch (err) {
    return false;
  }
}

async function setSchema() {
  // const op = new dgraph.Operation();
  // op.setSchema(schema);
  // await dgraphClient.alter(op).catch((err) => {
  //
  // });
}

export default SetupDgraph;
