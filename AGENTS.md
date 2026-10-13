<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep clinic branding and shared page presentation in the clinic components; leaf routes own unique metadata.
- Store appointment requests in patient_records with nullable guest ownership and insert-only guest RLS; validate any supplied session and preserve authenticated ownership so patient details stay private. Preferred times are not confirmed availability.
- The public doctor sign-in surface loads private records only through authenticated server functions and RLS checking protected user_roles; profiles contain names only, never privileges.
- Keep FDI tooth numbering and patient edit validation in a shared dental-chart module so the saved chart and clinical validation agree.
- Do not send WhatsApp reminders until a Business connection and approved templates are configured; consent does not imply delivery.
