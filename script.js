 let countdownInterval = null;//الفكرو منه انو انشئ متغير عام بحيث بستخدمو لاحقا لحتى خزن مؤقت العد التناولي

        async function getPrayerTimes() {//دالة جلب مواقيت الصلاة من خلال استدعاء API
            const date = document.getElementById('dateInput').value;
            const city = document.getElementById('cityInput').value;
            const country = document.getElementById('countryInput').value;

            if (!date || !city ) {
                 showError("Please fill Date and City at least");;
                return;
            }

            const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=${country}&method=4`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                 if (data.code === 200) {
                    const timings = data.data.timings;  // أوقات الصلوات
                    const hijri = data.data.date.hijri;       // التاريخ الهجري
                    const gregorian = data.data.date.gregorian; // التاريخ الميلادي
                    
                    //   هون عرض المدينة + التاريخ الميلادي والهجري
                    const gregDate = `${gregorian.day} ${gregorian.month.en} ${gregorian.year}`;
                    const hijriDate = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
                    document.getElementById('locationTitle').innerHTML = 
                        `<strong>${city.toUpperCase()}</strong><br>
                         <small  >${gregDate} | ${hijriDate}</small>`;
                    
                    // عرض المواقيت
                    document.getElementById('fajr').innerText = timings.Fajr;
                    document.getElementById('sunrise').innerText = timings.Sunrise;
                    document.getElementById('dhuhr').innerText = timings.Dhuhr;
                    document.getElementById('asr').innerText = timings.Asr;
                    document.getElementById('maghrib').innerText = timings.Maghrib;
                    document.getElementById('isha').innerText = timings.Isha;
                     document.getElementById('results').style.display = 'block';

                    // حساب الصلاة القادمة + العد التنازلي
                    calculateNextPrayer(timings);
                } else {
                      showError("City not found! Check your inputs.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                 showError("Network error. Please try again later.");
            }
        }

        function calculateNextPrayer(timings) {
            if (countdownInterval) clearInterval(countdownInterval);

            const prayers = [
                { name: 'Fajr', time: timings.Fajr, id: 'card-Fajr' },
                { name: 'Dhuhr', time: timings.Dhuhr, id: 'card-Dhuhr' },
                 { name: 'Asr', time: timings.Asr, id: 'card-Asr' },
                { name: 'Maghrib', time: timings.Maghrib, id: 'card-Maghrib' },
                { name: 'Isha', time: timings.Isha, id: 'card-Isha' }
            ];

            function updateCountdown() {    
                const now = new Date(); // هو وقت جهازك، وليس وقت المدينة المبحوث عنهاnow
                const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

                let nextPrayer = null;
                let nextPrayerInMinutes = null;

                for (let prayer of prayers) {
                    const [hours, minutes] = prayer.time.split(':').map(Number);//خذ وقت الصلاة، وحوّله إلى ساعات ودقائق كأرقام
                    const prayerTimeInMinutes = hours * 60 + minutes;

                    if (prayerTimeInMinutes > currentTimeInMinutes) {
                        nextPrayer = prayer;
                        nextPrayerInMinutes = prayerTimeInMinutes;
                        break;
                    }
                }
                 
                // إذا مافي صلاة مستقبلة، نأخذ أول صلاة من اليوم التالي
                //يعني هاد الكود ينفذ عندما تصبح كل الصلوات فائتة
                if (!nextPrayer) {
                    nextPrayer = prayers[0];//يعني احعل الصلاة القادمة هي اول صلاة من المصفوفة
                    const [hours, minutes] = nextPrayer.time.split(':').map(Number);
                    nextPrayerInMinutes = (24 * 60) + (hours * 60 + minutes);
                }
                        //  
                const diffInMinutes = nextPrayerInMinutes - currentTimeInMinutes;
                const hoursLeft = Math.floor(diffInMinutes / 60);
                const minutesLeft = Math.floor(diffInMinutes % 60);
                const secondsLeft = Math.floor((diffInMinutes * 60) % 60);

                document.getElementById('nextPrayer').innerHTML = 
                    `${nextPrayer.name} at ${nextPrayer.time}<br>
                     <span class="countdown">⏳ متبقي ${hoursLeft}س ${minutesLeft}د ${secondsLeft}ث</span>`;

                document.querySelectorAll('.prayer-card').forEach(card => {
                    card.classList.remove('active');
                });
                const activeCard = document.getElementById(nextPrayer.id);
                if (activeCard) activeCard.classList.add('active');
            }

            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
        } 
            
        // دالة عرض رسالة الخطأ    
    function showError(message) {
    const toast = document.getElementById('toastMessage');
    const toastText = document.getElementById('toastText');

    toastText.textContent = message;
    toast.classList.remove('hidden');

    // تأثير الظهور
    void toast.offsetWidth;
    toast.classList.add('show');

    // إخفاء بعد 3 ثوانٍ
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}