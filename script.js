// Sticky nav shadow
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.boxShadow =
    window.scrollY > 10 ? '0 2px 16px rgba(0,0,0,0.08)' : 'none';
});

// ── FORM ──────────────────────────────────────
const form       = document.getElementById('demo-form');
const submitBtn  = document.getElementById('submit-btn');
const btnText    = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const successMsg = document.getElementById('form-success');
const errorMsg   = document.getElementById('form-error');

function showFieldError(input, msg) {
  input.classList.add('invalid');
  input.closest('.form-group').querySelector('.field-error').textContent = msg;
}
function clearFieldError(input) {
  input.classList.remove('invalid');
  const el = input.closest('.form-group').querySelector('.field-error');
  if (el) el.textContent = '';
}

function validate() {
  let ok = true;
  const fname   = form.querySelector('#fname');
  const lname   = form.querySelector('#lname');
  const email   = form.querySelector('#email');
  const company = form.querySelector('#company');

  [fname, lname, email, company].forEach(clearFieldError);

  if (!fname.value.trim())   { showFieldError(fname,   'First name is required.');     ok = false; }
  if (!lname.value.trim())   { showFieldError(lname,   'Last name is required.');      ok = false; }
  if (!company.value.trim()) { showFieldError(company, 'Company name is required.');   ok = false; }
  if (!email.value.trim()) {
    showFieldError(email, 'Email is required.'); ok = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showFieldError(email, 'Enter a valid email address.'); ok = false;
  }
  return ok;
}

form.querySelectorAll('input').forEach(input =>
  input.addEventListener('input', () => clearFieldError(input))
);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  successMsg.style.display = 'none';
  errorMsg.style.display   = 'none';

  if (!validate()) return;

  submitBtn.disabled       = true;
  btnText.style.display    = 'none';
  btnLoading.style.display = 'inline-flex';

  try {
    const res = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: form.querySelector('#fname').value.trim(),
        last_name:  form.querySelector('#lname').value.trim(),
        email:      form.querySelector('#email').value.trim(),
        phone:      form.querySelector('#phone').value.trim(),
        company:    form.querySelector('#company').value.trim(),
        message:    form.querySelector('#message').value.trim(),
      }),
    });

    if (res.ok) {
      form.reset();
      successMsg.style.display = 'flex';
    } else {
      const data = await res.json();
      console.error('API error:', data.error);
      errorMsg.style.display = 'flex';
    }
  } catch (err) {
    console.error('Network error:', err);
    errorMsg.style.display = 'flex';
  } finally {
    submitBtn.disabled       = false;
    btnText.style.display    = 'inline';
    btnLoading.style.display = 'none';
  }
});
