from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
import datetime

from core.models import (
    Profile, Skill, FreelancerSkill, Booking, Invoice, Review,
    Portfolio, normalize_skill_name
)

class Command(BaseCommand):
    help = 'Cleans up test/dummy data and seeds realistic showcase freelancer marketplace data.'

    def handle(self, *args, **options):
        self.stdout.write("Normalizing skills and seeding showcase data...")

        # 1. Normalize all existing skills in the database
        all_skills = list(Skill.objects.all())
        for sk in all_skills:
            canonical = normalize_skill_name(sk.name)
            if canonical != sk.name:
                existing = Skill.objects.filter(name=canonical).exclude(id=sk.id).first()
                if existing:
                    # Point relations to existing
                    for fs in FreelancerSkill.objects.filter(skill=sk):
                        if not FreelancerSkill.objects.filter(profile=fs.profile, skill=existing).exists():
                            fs.skill = existing
                            fs.save()
                        else:
                            fs.delete()
                    sk.delete()
                else:
                    sk.name = canonical
                    sk.save()

        # 2. Clean up dummy 'freelancer_test' test user safely
        test_users = User.objects.filter(username__in=['freelancer_test', 'testuser'])
        for tu in test_users:
            tu.delete()

        # 3. Create or update primary showcase client users
        client_data = [
            {'username': 'sarah_client', 'first_name': 'Sarah', 'last_name': 'Vance', 'email': 'sarah.vance@techcorp.io'},
            {'username': 'michael_client', 'first_name': 'Michael', 'last_name': 'Scott', 'email': 'm.scott@enterprise.com'},
            {'username': 'Selvan', 'first_name': 'Selvan', 'last_name': 'Kumar', 'email': 'selvan.k@freelancehub.dev'},
        ]
        clients = []
        for cd in client_data:
            u, created = User.objects.get_or_create(username=cd['username'], defaults={
                'first_name': cd['first_name'],
                'last_name': cd['last_name'],
                'email': cd['email']
            })
            u.first_name = cd['first_name']
            u.last_name = cd['last_name']
            u.email = cd['email']
            if created:
                u.set_password('Password123!')
            u.save()
            u.profile.role = 'client'
            u.profile.location = 'San Francisco, CA'
            u.profile.bio = 'Technical Product Director sourcing elite freelance engineers for scalable applications.'
            u.profile.contact_email = cd['email']
            u.profile.save()
            clients.append(u)

        # 4. Realistic Showcase Freelancers
        showcase_freelancers = [
            {
                'username': 'alex_rivera',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'email': 'alex.rivera@fullstack.dev',
                'title': 'Lead Full-Stack Architect',
                'hourly_rate': Decimal('95.00'),
                'location': 'San Francisco, CA',
                'experience_years': 8,
                'availability': True,
                'is_verified': True,
                'bio': 'Full-stack software architect with 8+ years building enterprise SaaS platforms, resilient APIs, and reactive React applications. Specializes in Django, React, PostgreSQL, and AWS infrastructure.',
                'education': 'B.S. in Computer Science, Stanford University',
                'experience_detail': 'Lead Architect at CloudWave (4 yrs), Senior Software Engineer at FinTech Labs (4 yrs)',
                'certificates': 'AWS Certified Solutions Architect (Professional), Certified Kubernetes Administrator',
                'languages': 'English (Native), Spanish (Fluent)',
                'skills': ['React', 'Python', 'Django', 'PostgreSQL', 'AWS', 'Docker', 'REST API', 'TypeScript'],
                'portfolios': [
                    {
                        'title': 'SaaS Analytics & Billing Platform',
                        'description': 'Engineered real-time billing metrics engine processing 20M+ events monthly using Django & React.',
                        'external_link': 'https://github.com/showcase/saas-billing'
                    },
                    {
                        'title': 'High-Throughput GraphQL Gateway',
                        'description': 'Designed microservices aggregation layer with Redis caching and sub-15ms p99 latency.',
                        'external_link': 'https://github.com/showcase/graphql-gateway'
                    }
                ],
                'reviews': [
                    {'client_idx': 0, 'rating': 5, 'comment': 'Alex delivered our core SaaS dashboard ahead of schedule with immaculate code quality and test coverage. Outstanding architect.'},
                    {'client_idx': 1, 'rating': 5, 'comment': 'Exceptional problem solver! Refactored our legacy Django backend and improved response times by 65%.'},
                    {'client_idx': 2, 'rating': 4, 'comment': 'Great communication, clean PRs, and proactive suggestions throughout the project.'}
                ]
            },
            {
                'username': 'elena_rostova',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'email': 'elena.rostova@designsystems.io',
                'title': 'Senior UI/UX & Frontend Engineer',
                'hourly_rate': Decimal('85.00'),
                'location': 'Berlin, Germany',
                'experience_years': 6,
                'availability': True,
                'is_verified': True,
                'bio': 'Specialized in modern design systems, micro-interactions, and accessible high-performance React/Next.js interfaces. Passionate about turning complex workflows into intuitive user experiences.',
                'education': 'M.A. in Human-Computer Interaction, TU Berlin',
                'experience_detail': 'Senior Design Technologist at StudioPulse (3 yrs), Frontend Engineer at BerlinFin (3 yrs)',
                'certificates': 'Nielsen Norman Group UX Master Certified, Google UX Design Professional',
                'languages': 'English (Fluent), German (Fluent)',
                'skills': ['React', 'TypeScript', 'UI/UX', 'Next.js', 'TailwindCSS', 'Figma', 'CSS', 'JavaScript'],
                'portfolios': [
                    {
                        'title': 'Enterprise Design System Library',
                        'description': 'Comprehensive component library with 80+ components, automated visual regression tests, and full WCAG 2.1 AA compliance.',
                        'external_link': 'https://github.com/showcase/design-system'
                    }
                ],
                'reviews': [
                    {'client_idx': 0, 'rating': 5, 'comment': 'Elena transformed our user interface completely. User retention jumped 40% after the redesign. Highly recommended!'},
                    {'client_idx': 1, 'rating': 5, 'comment': 'Top-tier design sensibility combined with clean TypeScript code. A rare gem.'}
                ]
            },
            {
                'username': 'marcus_chen',
                'first_name': 'Marcus',
                'last_name': 'Chen',
                'email': 'marcus.chen@cloudops.tech',
                'title': 'Principal Cloud & DevOps Architect',
                'hourly_rate': Decimal('115.00'),
                'location': 'Austin, TX',
                'experience_years': 9,
                'availability': True,
                'is_verified': True,
                'bio': 'DevOps specialist focused on Kubernetes multi-cluster deployments, CI/CD automation pipelines, infrastructure as code (Terraform), and high availability zero-downtime migrations.',
                'education': 'B.S. in Electrical Engineering, UT Austin',
                'experience_detail': 'Principal Infrastructure Lead at ScaleCloud (5 yrs), Senior DevOps Engineer at RapidDeploy (4 yrs)',
                'certificates': 'AWS Solutions Architect Professional, CKA & CKS, Terraform Associate',
                'languages': 'English (Native), Mandarin (Conversational)',
                'skills': ['DevOps', 'AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Python', 'Golang', 'PostgreSQL'],
                'portfolios': [
                    {
                        'title': 'Automated Multi-Region Kubernetes Fleet',
                        'description': 'Zero-downtime deployment pipeline supporting 50+ microservices with GitOps and ArgoCD.',
                        'external_link': 'https://github.com/showcase/k8s-gitops'
                    }
                ],
                'reviews': [
                    {'client_idx': 0, 'rating': 5, 'comment': 'Marcus set up our entire production AWS cluster with Terraform and GitHub Actions. Seamless execution.'},
                    {'client_idx': 2, 'rating': 5, 'comment': 'Flawless zero-downtime migration of our database and core services. Marcus is a true infrastructure master.'}
                ]
            },
            {
                'username': 'sarah_jenkins',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'email': 'sarah.jenkins@aimlresearch.com',
                'title': 'AI/ML & Python Specialist',
                'hourly_rate': Decimal('125.00'),
                'location': 'London, UK',
                'experience_years': 7,
                'availability': True,
                'is_verified': True,
                'bio': 'Machine learning engineer crafting custom LLM pipelines, RAG systems, predictive recommendation models, and high-performance FastAPI backend microservices.',
                'education': 'M.Sc. in Machine Learning, Imperial College London',
                'experience_detail': 'Lead AI Engineer at SynthAI (4 yrs), Data Scientist at DeepInsight UK (3 yrs)',
                'certificates': 'TensorFlow Developer Certificate, DeepLearning.AI Specialization',
                'languages': 'English (Native), French (Intermediate)',
                'skills': ['Python', 'AI/ML', 'PyTorch', 'FastAPI', 'Machine Learning', 'PostgreSQL', 'Docker', 'REST API'],
                'portfolios': [
                    {
                        'title': 'Enterprise RAG Search Engine',
                        'description': 'Vector similarity search over 500k documents with sub-100ms retrieval using pgvector and FastAPI.',
                        'external_link': 'https://github.com/showcase/rag-search'
                    }
                ],
                'reviews': [
                    {'client_idx': 1, 'rating': 5, 'comment': 'Sarah built a state-of-the-art semantic search system for our product catalog that exceeded all performance benchmarks.'},
                    {'client_idx': 2, 'rating': 5, 'comment': 'Brilliant AI engineer with deep knowledge of modern ML architectures and practical production deployment.'}
                ]
            },
            {
                'username': 'priya_sharma',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'email': 'priya.sharma@backendpro.dev',
                'title': 'Backend Systems & Database Engineer',
                'hourly_rate': Decimal('90.00'),
                'location': 'Bengaluru, India',
                'experience_years': 6,
                'availability': True,
                'is_verified': True,
                'bio': 'Backend software engineer specializing in scalable Django systems, complex relational database optimization, Redis queues, and secure payment processing architectures.',
                'education': 'B.Tech in Information Technology, NIT Trichy',
                'experience_detail': 'Senior Backend Engineer at PayFlow (3 yrs), Software Engineer at TechZen (3 yrs)',
                'certificates': 'Oracle Certified Professional (PostgreSQL), Redis Certified Developer',
                'languages': 'English (Fluent), Hindi (Native), Tamil (Fluent)',
                'skills': ['Python', 'Django', 'PostgreSQL', 'Redis', 'REST API', 'Docker', 'SQL', 'FastAPI'],
                'portfolios': [
                    {
                        'title': 'Distributed Payment & Escrow Engine',
                        'description': 'ACID-compliant multi-currency escrow processing engine with webhook idempotent retries.',
                        'external_link': 'https://github.com/showcase/escrow-engine'
                    }
                ],
                'reviews': [
                    {'client_idx': 0, 'rating': 5, 'comment': 'Priya optimized our slowest PostgreSQL queries from 4.2s down to 35ms. Outstanding database expertise.'},
                    {'client_idx': 1, 'rating': 5, 'comment': 'Extremely reliable, writes thorough unit tests, and delivers rock-solid backend code.'}
                ]
            },
            {
                'username': 'david_kim',
                'first_name': 'David',
                'last_name': 'Kim',
                'email': 'david.kim@webcraft.ca',
                'title': 'Full-Stack Developer & React Specialist',
                'hourly_rate': Decimal('75.00'),
                'location': 'Toronto, Canada',
                'experience_years': 5,
                'availability': False,
                'is_verified': True,
                'bio': 'Versatile full-stack developer with a passion for clean component architecture, responsive mobile-first UI, Node.js/Python backends, and seamless third-party API integrations.',
                'education': 'B.S. in Computer Science, University of Toronto',
                'experience_detail': 'Full-Stack Engineer at MapleDigital (3 yrs), Frontend Developer at NexaLab (2 yrs)',
                'certificates': 'Meta Certified Full-Stack Developer, AWS Certified Developer',
                'languages': 'English (Native), Korean (Fluent)',
                'skills': ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'TailwindCSS', 'HTML5', 'CSS3'],
                'portfolios': [
                    {
                        'title': 'Interactive Collaborative Workspace',
                        'description': 'Real-time kanban and document collaboration tool with WebSocket synchronization.',
                        'external_link': 'https://github.com/showcase/collaborative-workspace'
                    }
                ],
                'reviews': [
                    {'client_idx': 0, 'rating': 4, 'comment': 'Solid frontend work, great responsive layout and quick turnarounds.'},
                    {'client_idx': 2, 'rating': 5, 'comment': 'David built our client onboarding flow with great attention to detail. Excellent developer!'}
                ]
            }
        ]

        for data in showcase_freelancers:
            u, created = User.objects.get_or_create(username=data['username'], defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data['email']
            })
            u.first_name = data['first_name']
            u.last_name = data['last_name']
            u.email = data['email']
            if created:
                u.set_password('Password123!')
            u.save()

            p = u.profile
            p.role = 'freelancer'
            p.title = data['title']
            p.hourly_rate = data['hourly_rate']
            p.location = data['location']
            p.experience_years = data['experience_years']
            p.availability = data['availability']
            p.is_verified = data['is_verified']
            p.bio = data['bio']
            p.education = data['education']
            p.experience_detail = data['experience_detail']
            p.certificates = data['certificates']
            p.languages = data['languages']
            p.contact_email = data['email']
            p.save()

            # Attach skills
            for skill_str in data['skills']:
                canonical = normalize_skill_name(skill_str)
                sk, _ = Skill.objects.get_or_create(name=canonical)
                FreelancerSkill.objects.get_or_create(profile=p, skill=sk)

            # Portfolios
            for port in data['portfolios']:
                Portfolio.objects.get_or_create(
                    profile=p,
                    title=port['title'],
                    defaults={
                        'description': port['description'],
                        'external_link': port.get('external_link', '')
                    }
                )

            # Create completed bookings and reviews
            for rev_data in data['reviews']:
                client_user = clients[rev_data['client_idx']]
                start_d = datetime.date.today() - datetime.timedelta(days=30)
                end_d = datetime.date.today() - datetime.timedelta(days=20)
                booking, _ = Booking.objects.get_or_create(
                    client=client_user,
                    freelancer=u,
                    defaults={
                        'start_date': start_d,
                        'end_date': end_d,
                        'description': f"Consulting engagement: {data['title']}",
                        'status': 'completed'
                    }
                )
                booking.status = 'completed'
                booking.save()

                review, _ = Review.objects.get_or_create(
                    reviewer=client_user,
                    reviewee=u,
                    defaults={
                        'booking': booking,
                        'rating': rev_data['rating'],
                        'comment': rev_data['comment']
                    }
                )
                review.rating = rev_data['rating']
                review.comment = rev_data['comment']
                review.save()

        # Update existing user 'Tami!' if present with complete details
        tami = User.objects.filter(username='Tami!').first()
        if tami:
            tami.first_name = 'Tamil'
            tami.last_name = 'Selvan'
            tami.save()
            p = tami.profile
            p.role = 'freelancer'
            p.title = 'Senior Python & React Engineer'
            p.hourly_rate = Decimal('80.00')
            p.location = 'Chennai, India'
            p.experience_years = 5
            p.availability = True
            p.is_verified = True
            p.bio = 'Experienced full-stack developer specialized in Python, Django, React, and modern web application development.'
            p.contact_email = 'tamilselvan2312@gmail.com'
            p.save()
            for s_name in ['React', 'Python', 'Full Stack', 'Django']:
                sk, _ = Skill.objects.get_or_create(name=normalize_skill_name(s_name))
                FreelancerSkill.objects.get_or_create(profile=p, skill=sk)

        self.stdout.write(self.style.SUCCESS("Successfully seeded showcase profiles and cleaned test data!"))
