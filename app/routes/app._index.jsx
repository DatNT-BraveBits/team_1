import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { features } from "../nav-config";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Dashboard() {
  return (
    <s-page heading="Dashboard">
      <s-section heading="Features">
        <s-grid columns="2">
          {features.map((f) => (
            <s-card key={f.href}>
              <s-box padding="base">
                <s-stack direction="block" gap="base">
                  <s-heading>{f.label}</s-heading>
                  <s-link href={f.href}>
                    <s-button>Open</s-button>
                  </s-link>
                </s-stack>
              </s-box>
            </s-card>
          ))}
        </s-grid>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
