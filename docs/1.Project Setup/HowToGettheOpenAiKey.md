# Getting Your OpenAI API Key

> **Purpose**: Create and secure an OpenAI API key, then add the minimum US$5 credit required to start making requests from your apps or backend services.

---

## Video Walkthrough

Watch these quick steps in action: [YouTube Short](https://youtube.com/shorts/E6JFbrqUX9c?feature=share)

---

## 1. Prerequisites

- A valid email address **and** mobile phone number (for verification).
- A payment method capable of adding credit to your OpenAI account.
- An OpenAI account (create one at <https://platform.openai.com> if you do not already have one).

---

## 2. Sign In or Create an Account

1. Navigate to the **OpenAI Platform**: <https://platform.openai.com>  
2. Click **Log in** or **Sign up** and follow the on‑screen steps.  
3. **Verify your email address** (check your inbox for the confirmation link).

---

## 3. Verify Your Phone Number

Before any API key can be generated, OpenAI requires a one‑time phone number verification:

1. In the dashboard, you will be prompted to **Add a phone number**.  
2. Enter a valid mobile number (VOIP numbers are typically rejected).  
3. Enter the 6‑digit code sent via SMS to complete verification.

> Once verified, the “API keys” section becomes available.

---

## 4. Generate an API Key

1. In the left‑hand sidebar, click **API keys** (under the **Developers** section).  
2. Press **+ Create new secret key**.  
3. **(Optional)** Give the key a name that describes its use—e.g., `personal‑backend`, `saas‑prod`, etc.  
4. Select a usage scope:
   - **Default project (personal use)** – good for testing, hobby apps, local development.  
   - **Service account / team project** – best for production servers, SaaS products, or CI/CD.
5. Click **Create secret key**.
6. **Copy the key immediately**—this is the **only** time it will be displayed.  
7. Store the key securely (e.g., password manager or CI secret vault).  

```env
# .env (example)
OPENAI_API_KEY=sk‑...
```

> **Never** hard‑code the key in your source files and **never** share it publicly.

---

## 5. Add a Minimum Credit (US$5)

OpenAI requires a small initial credit load before an account can issue live requests:

1. In the sidebar, click **Billing → Payments**.  
2. Select **Add payment method** and enter card details.  
3. Choose **Add credit** → type **$5** → **Add funds**.  
4. Once the transaction succeeds, your usage quota becomes active.

> Without at least **US$5** of prepaid credit (or an approved billing plan), API calls will return `invalid_request_error: Must add funds first`.

---

## 6. Test the Key in the Playground

1. Click **Playground** in the sidebar.  
2. Ensure the **Organization** and **Project** match the key you just generated.  
3. Type a prompt—e.g., `Say hello`—and press **Submit**.  
4. A successful response confirms that the key and credit are active.

---

## 7. Next Steps

- **Integrate the key** into your backend (`process.env.OPENAI_API_KEY`).  
- **Rotate** or **revoke** keys periodically via **API keys → ⋯ → Delete**.  
- Monitor usage in **Usage → Daily cost** to avoid unexpected charges.

---

### Troubleshooting

| Issue | Fix |
|-------|-----|
| *`invalid_request_error: Billing hard limit reached`* | Add more credit or raise the hard‑limit in **Billing → Usage limits**. |
| Unable to verify phone | Use a non‑VOIP mobile number; one account per phone number limit applies. |
| Key leaked publicly | Revoke the key immediately and create a new one. |

---

**Congratulations!** You now have a secure, funded OpenAI API key ready for use in your projects.

