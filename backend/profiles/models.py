"""
Profile models for profiles app.
"""
from django.db import models
from django.conf import settings


class InterestTag(models.Model):
    """Interest tags for user profiles."""
    
    slug = models.SlugField(unique=True, max_length=50)
    display_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'interest_tags'
        ordering = ['display_name']

    def __str__(self):
        return self.display_name


class Profile(models.Model):
    """User profile model."""
    
    DEPARTMENT_CHOICES = [
        # EĞİTİM FAKÜLTESİ (Education Faculty)
        ('EDU_PRIMARY', 'Temel Eğitim (Sınıf Öğretmenliği)'),
        ('EDU_SCIENCES', 'Eğitim Bilimleri'),
        ('EDU_TEFL', 'Yabancı Dil Olarak İngilizce Öğretimi'),
        
        # FEN FAKÜLTESİ (Science Faculty)
        ('PHYS', 'Fizik'),
        ('CHEM', 'Kimya'),
        ('MATH', 'Matematik'),
        ('MBG', 'Moleküler Biyoloji ve Genetik'),
        
        # GÜZEL SANATLAR, TASARIM VE MİMARLIK FAKÜLTESİ (Fine Arts, Design and Architecture Faculty)
        ('GD', 'Grafik Tasarımı'),
        ('FA', 'Güzel Sanatlar'),
        ('IAED', 'İç Mimarlık ve Çevre Tasarımı'),
        ('CD', 'İletişim ve Tasarımı'),
        ('UDLA', 'Kentsel Tasarım ve Peyzaj Mimarlığı'),
        ('ARCH', 'Mimarlık'),
        
        # İKTİSADİ, İDARİ VE SOSYAL BİLİMLER FAKÜLTESİ (Economics, Administrative and Social Sciences Faculty)
        ('ECON', 'İktisat'),
        ('PSYC', 'Psikoloji'),
        ('POL', 'Siyaset Bilimi ve Kamu Yönetimi'),
        ('HIST', 'Tarih'),
        ('IR', 'Uluslararası İlişkiler'),
        
        # İNSANİ BİLİMLER VE EDEBİYAT FAKÜLTESİ (Humanities and Literature Faculty)
        ('ACL', 'Amerikan Kültürü ve Edebiyatı'),
        ('ARCHAE', 'Arkeoloji'),
        ('PHIL', 'Felsefe'),
        ('ELIT', 'İngiliz Dili ve Edebiyatı'),
        ('TRANS', 'İngilizce, Fransızca Mütercim ve Tercümanlık'),
        ('TLIT', 'Türk Edebiyatı'),
        
        # İŞLETME FAKÜLTESİ (Business Faculty)
        ('BUS', 'İşletme'),
        
        # HUKUK FAKÜLTESİ (Law Faculty)
        ('LAW', 'Hukuk Fakültesi'),
        
        # MÜHENDİSLİK FAKÜLTESİ (Engineering Faculty)
        ('CS', 'Bilgisayar Mühendisliği'),
        ('EE', 'Elektrik – Elektronik Mühendisliği'),
        ('IE', 'Endüstri Mühendisliği'),
        ('ME', 'Makine Mühendisliği'),
        
        # MÜZİK VE SAHNE SANATLARI FAKÜLTESİ (Music and Performing Arts Faculty)
        ('MUSIC', 'Müzik'),
        ('THEATRE', 'Tiyatro'),
        
        # UYGULAMALI BİLİMLER FAKÜLTESİ (Applied Sciences Faculty)
        ('IST', 'Bilişim Sistemleri ve Teknolojileri'),
        ('TOH', 'Turizm ve Otel İşletmeciliği'),
    ]

    STUDY_LEVEL_CHOICES = [
        ('PREP', 'Hazırlık'),
        ('UG', 'Lisans'),
        ('GR', 'Yüksek Lisans'),
        ('PHD', 'Doktora'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    initials = models.CharField(max_length=10)
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    study_level = models.CharField(max_length=5, choices=STUDY_LEVEL_CHOICES)
    about_text = models.TextField(max_length=500, blank=True)
    interests = models.ManyToManyField(InterestTag, blank=True, related_name='profiles')
    profile_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.initials} - {self.user.email}'

    def save(self, *args, **kwargs):
        """Auto-generate initials if not provided."""
        if not self.initials:
            self.initials = self._generate_initials()
        super().save(*args, **kwargs)

    def _generate_initials(self):
        """Generate initials from user's name."""
        first = self.user.first_name[0].upper() if self.user.first_name else ''
        last = self.user.last_name[0].upper() if self.user.last_name else ''
        return f'{first}{last}'

