import { app, db } from './my-firebase-app/src/firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById('uploadForm');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const msgEl = document.getElementById('msg');
const progressWrap = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');

function setMsg(text, ok = true) {
    msgEl.textContent = text;
    msgEl.className = 'upload-msg ' + (ok ? 'ok' : 'error');
}

function resetForm() {
    form.reset();
    if (progressWrap) progressWrap.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';
    setMsg('');
}

resetBtn.addEventListener('click', resetForm);

function isValidUrl(str) {
    try { new URL(str); return true; } catch { return false; }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    setMsg('جاري حفظ بيانات التطبيق...');

    const name = document.getElementById('name').value.trim();
    const dev = document.getElementById('dev').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const category = document.getElementById('category').value.trim() || 'عام';
    const rating = parseFloat(document.getElementById('rating').value) || 0;
    const icon = document.getElementById('icon').value.trim();
    const screenshotsRaw = document.getElementById('screenshots').value || '';
    const downloadLink = document.getElementById('downloadLink').value.trim();

    // تحويل نص لروابط مصفوفة
    const screenshots = screenshotsRaw
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean);

    // تحقق من الحقول المطلوبة
    if (!name || !dev || !desc) {
        setMsg('الرجاء ملء الحقول الإلزامية (الاسم، المطوّر، الوصف).', false);
        submitBtn.disabled = false;
        return;
    }

    if (!icon || !isValidUrl(icon)) {
        setMsg('الرجاء إدخال رابط صحيح لأيقونة التطبيق.', false);
        submitBtn.disabled = false;
        return;
    }

    if (!downloadLink || !isValidUrl(downloadLink)) {
        setMsg('الرجاء إدخال رابط تحميل صالح للتطبيق.', false);
        submitBtn.disabled = false;
        return;
    }

    try {
        if (progressWrap) progressWrap.style.display = 'block';
        if (progressBar) progressBar.style.width = '60%';

        const docRef = await addDoc(collection(db, 'apps'), {
            name,
            dev,
            desc,
            category,
            rating,
            icon,
            screenshots,
            downloadLink,
            createdAt: serverTimestamp()
        });

        if (progressBar) progressBar.style.width = '100%';
        setMsg('تم حفظ بيانات التطبيق بنجاح. معرف الوثيقة: ' + docRef.id);
        resetForm();
    } catch (err) {
        console.error(err);
        setMsg('حدث خطأ أثناء حفظ البيانات: ' + (err.message || err), false);
    } finally {
        submitBtn.disabled = false;
        setTimeout(() => {
            if (progressWrap) progressWrap.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
        }, 900);
    }
});
