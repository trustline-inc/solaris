import { expect } from "chai";

async function assertRevert(promise: any, errorString: string) {
  try {
    await promise;
  } catch (err) {
    expect(err.message).to.include(errorString);
  }
}

export default assertRevert;
