--
-- PostgreSQL database dump
--

\restrict PvB0IrJ4T0a220s2JUqFFcVpbUrOiqCK0w06CkBVZE1mX2qkSBhpDsATryBmazz

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CourseLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public."CourseLevel" OWNER TO postgres;

--
-- Name: CourseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public."CourseStatus" OWNER TO postgres;

--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."EnrollmentStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'STUDENT',
    'INSTRUCTOR',
    'ADMIN',
    'SUPERADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Course" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    thumbnail text,
    duration integer,
    level public."CourseLevel" NOT NULL,
    language text NOT NULL,
    price numeric(10,2) NOT NULL,
    rating numeric(3,2),
    status public."CourseStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "instructorId" integer
);


ALTER TABLE public."Course" OWNER TO postgres;

--
-- Name: Course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Course_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Course_id_seq" OWNER TO postgres;

--
-- Name: Course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Course_id_seq" OWNED BY public."Course".id;


--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Enrollment" (
    id integer NOT NULL,
    status public."EnrollmentStatus" NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer NOT NULL
);


ALTER TABLE public."Enrollment" OWNER TO postgres;

--
-- Name: Enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Enrollment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Enrollment_id_seq" OWNER TO postgres;

--
-- Name: Enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Enrollment_id_seq" OWNED BY public."Enrollment".id;


--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lesson" (
    id integer NOT NULL,
    title text NOT NULL,
    "videoUrl" text NOT NULL,
    duration integer,
    "sortOrder" integer NOT NULL,
    "isPreview" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "moduleId" integer NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO postgres;

--
-- Name: LessonProgress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LessonProgress" (
    id integer NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "userId" integer NOT NULL,
    "lessonId" integer NOT NULL
);


ALTER TABLE public."LessonProgress" OWNER TO postgres;

--
-- Name: LessonProgress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."LessonProgress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LessonProgress_id_seq" OWNER TO postgres;

--
-- Name: LessonProgress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."LessonProgress_id_seq" OWNED BY public."LessonProgress".id;


--
-- Name: Lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Lesson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Lesson_id_seq" OWNER TO postgres;

--
-- Name: Lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Lesson_id_seq" OWNED BY public."Lesson".id;


--
-- Name: Module; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Module" (
    id integer NOT NULL,
    title text NOT NULL,
    "sortOrder" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "courseId" integer NOT NULL
);


ALTER TABLE public."Module" OWNER TO postgres;

--
-- Name: Module_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Module_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Module_id_seq" OWNER TO postgres;

--
-- Name: Module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Module_id_seq" OWNED BY public."Module".id;


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text NOT NULL,
    "paymentMethod" text NOT NULL,
    "transactionId" text NOT NULL,
    status public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Payment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Payment_id_seq" OWNER TO postgres;

--
-- Name: Payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Payment_id_seq" OWNED BY public."Payment".id;


--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: Review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Review_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Review_id_seq" OWNER TO postgres;

--
-- Name: Review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Review_id_seq" OWNED BY public."Review".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    role public."UserRole" DEFAULT 'STUDENT'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "confirmEmailToken" text,
    "isEmailConfirmed" boolean DEFAULT false NOT NULL,
    "resetPasswordExpire" timestamp(3) without time zone,
    "resetPasswordToken" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Course id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course" ALTER COLUMN id SET DEFAULT nextval('public."Course_id_seq"'::regclass);


--
-- Name: Enrollment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment" ALTER COLUMN id SET DEFAULT nextval('public."Enrollment_id_seq"'::regclass);


--
-- Name: Lesson id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson" ALTER COLUMN id SET DEFAULT nextval('public."Lesson_id_seq"'::regclass);


--
-- Name: LessonProgress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress" ALTER COLUMN id SET DEFAULT nextval('public."LessonProgress_id_seq"'::regclass);


--
-- Name: Module id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Module" ALTER COLUMN id SET DEFAULT nextval('public."Module_id_seq"'::regclass);


--
-- Name: Payment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment" ALTER COLUMN id SET DEFAULT nextval('public."Payment_id_seq"'::regclass);


--
-- Name: Review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review" ALTER COLUMN id SET DEFAULT nextval('public."Review_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Course" (id, title, description, thumbnail, duration, level, language, price, rating, status, "createdAt", "updatedAt", "instructorId") FROM stdin;
1	Full Stack Web Development	Learn HTML, CSS, JavaScript, Node.js, PostgreSQL, and deploy real-world applications.	https://example.com/images/courses/fullstack.jpg	3600	BEGINNER	English	49.99	\N	PUBLISHED	2026-01-27 15:21:35.067	2026-01-27 15:21:35.067	\N
2	English spoken	Learn English, IELTS, everyday English.	https://example.com/images/courses/fullstack.jpg	6600	BEGINNER	English	2500.00	\N	PUBLISHED	2026-01-27 15:28:26.269	2026-01-27 15:28:26.269	\N
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Enrollment" (id, status, "enrolledAt", "userId", "courseId") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lesson" (id, title, "videoUrl", duration, "sortOrder", "isPreview", "createdAt", "moduleId") FROM stdin;
2	array	https://youtu.be/example	450	2	f	2026-01-27 15:52:59.87	1
1	welcome	https://youtu.be/example	450	1	t	2026-01-27 15:52:32.007	1
\.


--
-- Data for Name: LessonProgress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LessonProgress" (id, "isCompleted", "completedAt", "userId", "lessonId") FROM stdin;
\.


--
-- Data for Name: Module; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Module" (id, title, "sortOrder", "createdAt", "courseId") FROM stdin;
1	Getting Started with Node.js	1	2026-01-27 15:40:42.747	1
2	Now the DSA	2	2026-01-27 15:41:09.414	1
3	Be a problem solver	3	2026-01-27 15:42:37.411	1
4	System Design	4	2026-01-27 15:47:50.227	1
5	Deploy	5	2026-01-27 15:48:12.053	1
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, amount, currency, "paymentMethod", "transactionId", status, "createdAt", "userId", "courseId") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, rating, comment, "createdAt", "userId", "courseId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, phone, "passwordHash", role, "createdAt", "updatedAt", "confirmEmailToken", "isEmailConfirmed", "resetPasswordExpire", "resetPasswordToken") FROM stdin;
5	Kawsiq	kawsiq@example.com	\N	$2b$10$7x9u91fLZdAFsrp/G60pCurnOde7BxPChVbmOthR.jIFEVdzR5BjC	STUDENT	2026-01-26 16:48:01.877	2026-01-26 16:48:01.877	\N	f	\N	\N
6	Nasim	nasim@example.com	\N	$2b$10$s6LK/uPJbvUkjhb551UHyOf8gLhLou4OptcChjCvlYc8x81mtbLNu	STUDENT	2026-01-26 16:48:44.208	2026-01-26 16:48:44.208	\N	f	\N	\N
7	Rakib	rakib@example.com	\N	$2b$10$eaz5C58KwCeFjerC0TAvV.mtMT41/rPw6v7eZ5BrP..WE9F3oRVSe	STUDENT	2026-01-26 16:49:39.529	2026-01-26 16:49:39.529	\N	f	\N	\N
8	Mamun	manun@example.com	\N	$2b$12$bejopv5Dr17xO.HzfteFKObWDwJMCRrXADKGGauPiNtNB0/fg0DP6	STUDENT	2026-01-26 16:56:45.967	2026-01-26 16:56:45.967	21e3f9ddc63a0f0f37a1849f5b54999adaed62fd8cf4fef777fa08f0350da823	f	\N	\N
10	Rasel	rasel@example.com	\N	$2b$12$7OoBtaVaYfi6PL6ox4DOP.hmHKZ2f3q2Ga496JiR0uhxkbDYx3ZDq	STUDENT	2026-01-26 16:59:55.859	2026-01-26 16:59:55.859	78be90696422f92a2d744bda917cee05255e9e0954dd7636e334917588d9cecb	f	\N	\N
1	Rumon Khan	rumon@example.com	+1-555-0199	$2b$10$7x9u91fLZdAFsrp/G60pCurnOde7BxPChVbmOthR.jIFEVdzR5BjC	ADMIN	2026-01-26 15:10:13.055	2026-01-26 15:10:13.055	\N	f	\N	\N
2	Mahfuz Khan	Mahfuz@example.com	+1-555-0199	$2b$10$7x9u91fLZdAFsrp/G60pCurnOde7BxPChVbmOthR.jIFEVdzR5BjC	STUDENT	2026-01-26 15:18:48.258	2026-01-26 15:18:48.258	\N	f	\N	\N
4	Sabbir Mahmud Tanvir	Sabbir@example.com	+1-555-019901716814563	$2b$10$7x9u91fLZdAFsrp/G60pCurnOde7BxPChVbmOthR.jIFEVdzR5BjC	STUDENT	2026-01-26 15:19:46.869	2026-01-26 15:19:46.869	\N	f	\N	\N
15	moti	moti@example.com	\N	$2b$10$J7.Xtk7ETvfnFKbdzK81ceagR/tmRdyg.ZhDx.Iyxj4ZNg5sBfLDG	STUDENT	2026-01-27 13:33:10.977	2026-01-27 13:33:10.977	7c08188154363c48396d09c5aafd992f1e6126deaf5a2d777d50e1a0de69e368	f	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
948e51fd-1978-4dd8-b7e2-e2df0be3b2ee	3cc03ee3a9ab9c92a3986d05cc6f1abb0f37eb0f1f6ee9e9e42c8c0eb41c3432	2026-01-25 23:21:17.932922+06	20260125172117_init	\N	\N	2026-01-25 23:21:17.840364+06	1
f27af2b5-0074-4e31-bfa6-8410275ab15e	3af95e72c6e1a6a34fdde1587da7aaf7cf9319da329c37813f675ce1d8648b7a	2026-01-26 21:59:34.956071+06	20260126155934_init	\N	\N	2026-01-26 21:59:34.947221+06	1
f736ad5f-5ab3-4b17-9b3d-c817022ead2d	9e0ff22ad64822e5221840f5259311d755aa70fd8b4b41f20a167b05844f10e4	2026-01-26 22:54:39.011393+06	20260126165439_init	\N	\N	2026-01-26 22:54:39.005775+06	1
c43dbdd9-eb30-40d4-b962-ae02719ee801	e4cd1005c18e1ff65c55395dc60066b135712928b2390d2427efa8bf8f039aac	2026-01-27 21:21:06.837749+06	20260127152106_init	\N	\N	2026-01-27 21:21:06.809023+06	1
\.


--
-- Name: Course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Course_id_seq"', 2, true);


--
-- Name: Enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Enrollment_id_seq"', 1, false);


--
-- Name: LessonProgress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."LessonProgress_id_seq"', 1, false);


--
-- Name: Lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Lesson_id_seq"', 2, true);


--
-- Name: Module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Module_id_seq"', 5, true);


--
-- Name: Payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payment_id_seq"', 1, false);


--
-- Name: Review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Review_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 15, true);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: LessonProgress LessonProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Module Module_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Enrollment_userId_courseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON public."Enrollment" USING btree ("userId", "courseId");


--
-- Name: LessonProgress_userId_lessonId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON public."LessonProgress" USING btree ("userId", "lessonId");


--
-- Name: Payment_transactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_transactionId_key" ON public."Payment" USING btree ("transactionId");


--
-- Name: Review_userId_courseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_userId_courseId_key" ON public."Review" USING btree ("userId", "courseId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Course Course_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Enrollment Enrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LessonProgress LessonProgress_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LessonProgress LessonProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lesson Lesson_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Module Module_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict PvB0IrJ4T0a220s2JUqFFcVpbUrOiqCK0w06CkBVZE1mX2qkSBhpDsATryBmazz

