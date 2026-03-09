import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Dashboard() {
  return (
    <s-page heading="App-AI Dashboard">
      <s-section heading="Trust Badges">
        <s-card>
          <s-box padding="base">
            <s-stack direction="block" gap="base">
              <s-heading>Trust Badges</s-heading>
              <s-text>Configure product badges, countdown timers, and scheduling for your storefront.</s-text>
              <s-link href="/app/feature-1">
                <s-button variant="primary">Open Settings</s-button>
              </s-link>
            </s-stack>
          </s-box>
        </s-card>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
