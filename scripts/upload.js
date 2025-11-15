import { app, db } from './my-firebase-app/src/firebase-config.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const storage = getStorage(app);

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
    progressWrap.style.display = 'none';
    progressBar.style.width = '0%';
    setMsg('');
}

resetBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    setMsg('جاري التحضير للرفع...');

    const name = document.getElementById('name').value.trim();
    const dev = document.getElementById('dev').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const category = document.getElementById('category').value.trim() || 'عام';
    const rating = parseFloat(document.getElementById('rating').value) || 0;
    const iconFile = document.getElementById('icon').files[0];
    const screenshotsFiles = Array.from(document.getElementById('screenshots').files || []);

    if (!name || !dev || !desc || !iconFile) {
        setMsg('الرجاء ملء الحقول الإلزامية.', false);
        submitBtn.disabled = false;
        return;
    }

    try {
        progressWrap.style.display = 'block';
        // أولًا: رفع الأيقونة
        const ts = Date.now();
        const iconPath = `icons/${ts}_${iconFile.name}`;
        const iconRef = ref(storage, iconPath);
        const iconUpload = uploadBytesResumable(iconRef, iconFile);

        const iconURL = await new Promise((resolve, reject) => {
            iconUpload.on('state_changed', snapshot => {
                const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progressBar.style.width = percent + '%';
            }, reject, async () => {
                const url = await getDownloadURL(iconUpload.snapshot.ref);
                resolve(url);
            });
        });

        // ثم رفع لقطات الشاشة (إن وُجدت)
        const screenshotsURLs = [];
        for (let i = 0; i < screenshotsFiles.length; i++) {
            const file = screenshotsFiles[i];
            const path = `screenshots/${ts}_${i}_${file.name}`;
            const fileRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(fileRef, file);
            // انتظر انتهاء كل رفع (يمكن تحسين ليوازي)
            const url = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', snapshot => {
                    const totalProgress = 50 + Math.round(((i + (snapshot.bytesTransferred / snapshot.totalBytes)) / (screenshotsFiles.length + 1)) * 50);
                    progressBar.style.width = Math.min(totalProgress, 99) + '%';
                }, reject, async () => {
                    const durl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(durl);
                });
            });
            screenshotsURLs.push(url);
        }

        progressBar.style.width = '100%';

        // حفظ بيانات التطبيق في Firestore
        const docRef = await addDoc(collection(db, 'apps'), {
            name, dev, desc, category,
            rating,
            icon: iconURL,
            screenshots: screenshotsURLs,
            createdAt: serverTimestamp()
        });

        setMsg('تم رفع التطبيق بنجاح. معرف المستند: ' + docRef.id);
        resetForm();
    } catch (err) {
        console.error(err);
        setMsg('حدث خطأ أثناء الرفع: ' + (err.message || err), false);
    } finally {
        submitBtn.disabled = false;
        setTimeout(() => {
            progressWrap.style.display = 'none';
            progressBar.style.width = '0%';
        }, 800);
    }
});