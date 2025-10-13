import { mixpanelTracker } from "../../app.js";

export default function MixpanelEvent(
  eventName: string,
  properties: any
): void {
  mixpanelTracker.track(eventName, properties);
}
