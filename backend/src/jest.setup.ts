import startServers, { closeServers } from "./server/startServers";
jest.useFakeTimers();
jest.mock("./server/startServers", () => {
  return {
    __esModule: true,
    default: jest.fn(),
    closeServers: jest.fn(),
  };
});

export default async () => {
  // jest.useFakeTimers()
  // try {
  //     await startServers();
  // } catch (error) {
  //
  // }
};

// afterAll(async () => {
//     try {
//         jest.clearAllTimers();
//         await closeServers();
//     } catch (error) {
//
//     }
// });
