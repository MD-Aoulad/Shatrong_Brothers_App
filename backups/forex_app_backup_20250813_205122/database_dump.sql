--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: currency_sentiments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency_sentiments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    currency character varying(3) NOT NULL,
    current_sentiment character varying(10) NOT NULL,
    confidence_score integer NOT NULL,
    trend character varying(20) NOT NULL,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT currency_sentiments_confidence_score_check CHECK (((confidence_score >= 0) AND (confidence_score <= 100))),
    CONSTRAINT currency_sentiments_currency_check CHECK (((currency)::text = ANY ((ARRAY['EUR'::character varying, 'USD'::character varying, 'JPY'::character varying, 'GBP'::character varying, 'CAD'::character varying])::text[]))),
    CONSTRAINT currency_sentiments_current_sentiment_check CHECK (((current_sentiment)::text = ANY ((ARRAY['BULLISH'::character varying, 'BEARISH'::character varying, 'NEUTRAL'::character varying])::text[]))),
    CONSTRAINT currency_sentiments_trend_check CHECK (((trend)::text = ANY ((ARRAY['STRENGTHENING'::character varying, 'WEAKENING'::character varying, 'STABLE'::character varying])::text[])))
);


ALTER TABLE public.currency_sentiments OWNER TO postgres;

--
-- Name: economic_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.economic_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    currency character varying(3) NOT NULL,
    event_type character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    event_date timestamp without time zone NOT NULL,
    actual_value numeric(15,4),
    expected_value numeric(15,4),
    previous_value numeric(15,4),
    impact character varying(10) NOT NULL,
    sentiment character varying(10) NOT NULL,
    confidence_score integer NOT NULL,
    price_impact numeric(5,2),
    source character varying(100) NOT NULL,
    url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT economic_events_confidence_score_check CHECK (((confidence_score >= 0) AND (confidence_score <= 100))),
    CONSTRAINT economic_events_currency_check CHECK (((currency)::text = ANY ((ARRAY['EUR'::character varying, 'USD'::character varying, 'JPY'::character varying, 'GBP'::character varying, 'CAD'::character varying])::text[]))),
    CONSTRAINT economic_events_impact_check CHECK (((impact)::text = ANY ((ARRAY['HIGH'::character varying, 'MEDIUM'::character varying, 'LOW'::character varying])::text[]))),
    CONSTRAINT economic_events_sentiment_check CHECK (((sentiment)::text = ANY ((ARRAY['BULLISH'::character varying, 'BEARISH'::character varying, 'NEUTRAL'::character varying])::text[])))
);


ALTER TABLE public.economic_events OWNER TO postgres;

--
-- Name: sentiment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sentiment_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    currency character varying(3) NOT NULL,
    sentiment_date date NOT NULL,
    sentiment character varying(10) NOT NULL,
    confidence_score integer NOT NULL,
    price_change numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sentiment_history_confidence_score_check CHECK (((confidence_score >= 0) AND (confidence_score <= 100))),
    CONSTRAINT sentiment_history_currency_check CHECK (((currency)::text = ANY ((ARRAY['EUR'::character varying, 'USD'::character varying, 'JPY'::character varying, 'GBP'::character varying])::text[]))),
    CONSTRAINT sentiment_history_sentiment_check CHECK (((sentiment)::text = ANY ((ARRAY['BULLISH'::character varying, 'BEARISH'::character varying, 'NEUTRAL'::character varying])::text[])))
);


ALTER TABLE public.sentiment_history OWNER TO postgres;

--
-- Name: user_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_alerts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    currency character varying(3) NOT NULL,
    event_type character varying(50),
    sentiment_threshold integer,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_alerts_currency_check CHECK (((currency)::text = ANY ((ARRAY['EUR'::character varying, 'USD'::character varying, 'JPY'::character varying, 'GBP'::character varying])::text[]))),
    CONSTRAINT user_alerts_sentiment_threshold_check CHECK (((sentiment_threshold >= 0) AND (sentiment_threshold <= 100)))
);


ALTER TABLE public.user_alerts OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: currency_sentiments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currency_sentiments (id, currency, current_sentiment, confidence_score, trend, last_updated, created_at) FROM stdin;
df2fa5d6-4575-4c6f-b0cb-09eeffb60314	EUR	BULLISH	85	STRENGTHENING	2025-08-08 21:22:19.972321	2025-08-08 21:22:19.972321
ccf41182-b0c0-4f2e-ad29-c26c821872f7	USD	BEARISH	72	WEAKENING	2025-08-08 21:22:19.972321	2025-08-08 21:22:19.972321
699ac4d4-ccfc-46b0-9b58-9dc4e13b6e50	JPY	NEUTRAL	45	STABLE	2025-08-08 21:22:19.972321	2025-08-08 21:22:19.972321
da69b5ea-ae14-46e8-927f-2e6d56778d6a	GBP	BULLISH	68	STRENGTHENING	2025-08-08 21:22:19.972321	2025-08-08 21:22:19.972321
9cf28912-ba0a-4d62-9c8a-aae7586b781a	CAD	BEARISH	78	WEAKENING	2025-08-09 12:22:11.630601	2025-08-09 12:22:11.630601
\.


--
-- Data for Name: economic_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.economic_events (id, currency, event_type, title, description, event_date, actual_value, expected_value, previous_value, impact, sentiment, confidence_score, price_impact, source, url, created_at, updated_at) FROM stdin;
11f12025-728c-434f-894f-f9b13fc71850	EUR	CPI	Eurozone CPI Data	Consumer Price Index for Eurozone	2024-02-15 10:00:00	0.3000	0.2000	0.1000	HIGH	BULLISH	85	0.80	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
e08e4469-18d7-4083-8dff-938ef638b6d8	EUR	INTEREST_RATE	ECB Rate Decision	European Central Bank Interest Rate Decision	2024-03-14 13:45:00	4.5000	4.5000	4.2500	HIGH	BULLISH	78	0.60	European Central Bank	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
2a9d62c5-a144-42ad-b10f-6a1015f191d9	EUR	GDP	Eurozone GDP Growth	Eurozone Gross Domestic Product Growth	2024-04-30 11:00:00	0.4000	0.3000	0.2000	HIGH	BULLISH	82	0.70	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
93d61a9a-694b-45a2-bc84-44b8052c7ec2	EUR	EMPLOYMENT	Eurozone Employment Data	Eurozone Employment and Unemployment Data	2024-05-15 10:00:00	6.8000	7.0000	7.2000	MEDIUM	BULLISH	65	0.30	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
d311cb56-1cfd-4394-bae0-0fc41266afc3	EUR	RETAIL_SALES	Eurozone Retail Sales	Eurozone Retail Sales Data	2024-06-05 10:00:00	0.5000	0.3000	0.1000	MEDIUM	BULLISH	70	0.40	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
72860adf-a0bd-4a32-b572-47927c475d82	EUR	CPI	Eurozone CPI Data	Consumer Price Index for Eurozone	2024-07-15 10:00:00	0.2000	0.3000	0.3000	HIGH	BEARISH	75	-0.50	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
8e4d7351-7104-46cd-9e3b-eaabaf5b41b7	EUR	INTEREST_RATE	ECB Rate Decision	European Central Bank Interest Rate Decision	2024-08-14 13:45:00	4.2500	4.5000	4.5000	HIGH	BEARISH	80	-0.60	European Central Bank	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
3d319f2b-7fb8-4416-8541-f318f2fa9852	EUR	GDP	Eurozone GDP Growth	Eurozone Gross Domestic Product Growth	2024-09-30 11:00:00	0.2000	0.4000	0.4000	HIGH	BEARISH	78	-0.40	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
2ce9897e-3a9d-4b58-9508-e565d583ab97	EUR	EMPLOYMENT	Eurozone Employment Data	Eurozone Employment and Unemployment Data	2024-10-15 10:00:00	7.2000	6.8000	6.8000	MEDIUM	BEARISH	65	-0.30	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
cf254c6f-7b95-41a1-b638-62ed48d74fcb	EUR	RETAIL_SALES	Eurozone Retail Sales	Eurozone Retail Sales Data	2024-11-05 10:00:00	0.1000	0.3000	0.5000	MEDIUM	BEARISH	60	-0.20	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
be84b1ea-6e44-4773-899b-08811227b181	EUR	CPI	Eurozone CPI Data	Consumer Price Index for Eurozone	2024-12-15 10:00:00	0.1000	0.2000	0.2000	HIGH	NEUTRAL	50	0.00	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
0b660d43-e441-41c7-baae-099e895361b9	EUR	INTEREST_RATE	ECB Rate Decision	European Central Bank Interest Rate Decision	2025-01-14 13:45:00	4.0000	4.2500	4.2500	HIGH	BULLISH	75	0.50	European Central Bank	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
e51847a5-26c5-4511-89a5-c5fa424ccf82	EUR	CPI	Eurozone CPI Data	Consumer Price Index for Eurozone	2025-02-15 10:00:00	0.3000	0.2000	0.1000	HIGH	BULLISH	80	0.60	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a0ad4772-c200-46ff-ab60-f0f7524ddcd0	EUR	GDP	Eurozone GDP Growth	Eurozone Gross Domestic Product Growth	2025-03-30 11:00:00	0.5000	0.3000	0.2000	HIGH	BULLISH	85	0.80	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
4a98f18b-e34e-49c8-af82-bdf85999812b	EUR	EMPLOYMENT	Eurozone Employment Data	Eurozone Employment and Unemployment Data	2025-04-15 10:00:00	6.5000	6.8000	7.2000	MEDIUM	BULLISH	70	0.40	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
03c5d96d-9745-4b5a-97a5-9141438c9078	EUR	RETAIL_SALES	Eurozone Retail Sales	Eurozone Retail Sales Data	2025-05-05 10:00:00	0.6000	0.3000	0.1000	MEDIUM	BULLISH	75	0.50	Eurostat	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
6a8cd0db-c1c8-4d17-93aa-fb212ac11812	USD	INTEREST_RATE	Fed Rate Decision	Federal Reserve Interest Rate Decision	2024-02-14 14:00:00	5.2500	5.2500	5.2500	HIGH	BEARISH	72	-0.50	Federal Reserve	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
e9765ec5-dc0b-4f96-b008-e5d3a6f9ffb4	USD	CPI	US CPI Data	Consumer Price Index for United States	2024-03-15 08:30:00	0.4000	0.3000	0.2000	HIGH	BEARISH	78	-0.60	Bureau of Labor Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
ab079bba-5e26-410b-899b-8eb0956477c8	USD	GDP	US GDP Growth	United States Gross Domestic Product Growth	2024-04-25 08:30:00	2.1000	2.5000	2.8000	HIGH	BEARISH	75	-0.40	Bureau of Economic Analysis	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
812b6a76-3701-489d-b8fe-a54a9d3c8880	USD	EMPLOYMENT	US NFP Data	US Non-Farm Payrolls Data	2024-05-03 08:30:00	150000.0000	180000.0000	200000.0000	HIGH	BEARISH	80	-0.70	Bureau of Labor Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
9ba6bda5-a3ec-477d-9a32-b0dcf83d1be1	USD	RETAIL_SALES	US Retail Sales	US Retail Sales Data	2024-06-14 08:30:00	0.2000	0.4000	0.6000	MEDIUM	BEARISH	65	-0.30	Census Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
18ff1840-4c6a-4289-81ad-ba715d1fc155	USD	INTEREST_RATE	Fed Rate Decision	Federal Reserve Interest Rate Decision	2024-07-14 14:00:00	5.0000	5.2500	5.2500	HIGH	BULLISH	75	0.50	Federal Reserve	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
75c9a5f8-baff-48cd-9acb-bb94fe6373d6	USD	CPI	US CPI Data	Consumer Price Index for United States	2024-08-15 08:30:00	0.2000	0.4000	0.4000	HIGH	BULLISH	70	0.40	Bureau of Labor Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a359ca8e-3442-4624-8440-bb40456ebe48	USD	GDP	US GDP Growth	United States Gross Domestic Product Growth	2024-09-26 08:30:00	2.8000	2.1000	2.1000	HIGH	BULLISH	78	0.60	Bureau of Economic Analysis	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
346c226c-e959-4809-8bb6-4b0af3621ce1	USD	EMPLOYMENT	US NFP Data	US Non-Farm Payrolls Data	2024-10-04 08:30:00	220000.0000	180000.0000	150000.0000	HIGH	BULLISH	82	0.80	Bureau of Labor Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
d5a87dc0-c75d-451d-91ae-b477b5898790	USD	RETAIL_SALES	US Retail Sales	US Retail Sales Data	2024-11-15 08:30:00	0.5000	0.3000	0.2000	MEDIUM	BULLISH	68	0.30	Census Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
01023b58-ddff-4dd4-b6f9-54464dd637bf	USD	INTEREST_RATE	Fed Rate Decision	Federal Reserve Interest Rate Decision	2024-12-14 14:00:00	4.7500	5.0000	5.0000	HIGH	BULLISH	80	0.70	Federal Reserve	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
ab79027c-3f35-4d31-b4ac-f324aa50e626	USD	CPI	US CPI Data	Consumer Price Index for United States	2025-01-15 08:30:00	0.3000	0.4000	0.2000	HIGH	NEUTRAL	55	0.10	Bureau of Labor Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
7feac444-73fa-48f0-ab6c-d6b4bdb80091	USD	GDP	US GDP Growth	United States Gross Domestic Product Growth	2025-02-27 08:30:00	2.5000	2.8000	2.8000	HIGH	NEUTRAL	50	0.00	Bureau of Economic Analysis	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
d84d5602-6047-4361-9839-6d43c2b8b252	USD	EMPLOYMENT	US NFP Data	US Non-Farm Payrolls Data	2025-03-07 08:30:00	180000.0000	180000.0000	220000.0000	HIGH	NEUTRAL	52	0.00	Bureau of Labor Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
babb6c57-55fa-48eb-b65f-1430065df465	USD	RETAIL_SALES	US Retail Sales	US Retail Sales Data	2025-04-15 08:30:00	0.3000	0.3000	0.5000	MEDIUM	NEUTRAL	48	0.00	Census Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
8b54e5f3-7169-4f8b-b6f4-6eec344060b6	USD	INTEREST_RATE	Fed Rate Decision	Federal Reserve Interest Rate Decision	2025-05-14 14:00:00	4.5000	4.7500	4.7500	HIGH	BULLISH	75	0.50	Federal Reserve	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
4a7b0cce-adb1-48f8-ae07-2b4ae1431ce7	JPY	GDP	Japan GDP Growth	Japan Gross Domestic Product Growth	2024-02-13 09:00:00	1.2000	1.0000	0.8000	MEDIUM	NEUTRAL	45	0.20	Bank of Japan	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a72e5b0c-de03-44c4-95c0-479996c76147	JPY	INTEREST_RATE	BOJ Rate Decision	Bank of Japan Interest Rate Decision	2024-03-19 03:00:00	-0.1000	-0.1000	-0.1000	HIGH	NEUTRAL	50	0.00	Bank of Japan	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
d7403bde-8abb-4d36-a1fa-bbc3ea587753	JPY	CPI	Japan CPI Data	Consumer Price Index for Japan	2024-04-19 08:30:00	0.8000	0.9000	0.7000	MEDIUM	NEUTRAL	48	0.10	Statistics Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
6be3705f-b2f8-4e59-97b2-649829f2b84a	JPY	EMPLOYMENT	Japan Employment Data	Japan Employment and Unemployment Data	2024-05-31 08:30:00	2.5000	2.6000	2.4000	MEDIUM	NEUTRAL	52	0.00	Statistics Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
b007f82b-3a94-4659-bf6d-76ec269f6fd4	JPY	RETAIL_SALES	Japan Retail Sales	Japan Retail Sales Data	2024-06-28 08:30:00	0.3000	0.4000	0.2000	MEDIUM	NEUTRAL	45	0.00	Ministry of Economy	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
892d29f2-0be4-4d56-a174-86461847b0a5	JPY	GDP	Japan GDP Growth	Japan Gross Domestic Product Growth	2024-08-15 09:00:00	0.8000	1.2000	1.2000	MEDIUM	BEARISH	60	-0.30	Bank of Japan	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
40c323ea-0604-403c-814e-b19c633bedda	JPY	INTEREST_RATE	BOJ Rate Decision	Bank of Japan Interest Rate Decision	2024-09-19 03:00:00	-0.1000	-0.1000	-0.1000	HIGH	NEUTRAL	50	0.00	Bank of Japan	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a5513b75-dad3-40dd-a838-9c23525a3cfb	JPY	CPI	Japan CPI Data	Consumer Price Index for Japan	2024-10-18 08:30:00	0.6000	0.8000	0.8000	MEDIUM	BEARISH	55	-0.20	Statistics Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
b47f88a9-fb52-4495-a7c3-d3482652105d	JPY	EMPLOYMENT	Japan Employment Data	Japan Employment and Unemployment Data	2024-11-29 08:30:00	2.7000	2.5000	2.5000	MEDIUM	BEARISH	58	-0.10	Statistics Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
ffe08b2d-f00f-4aab-91a5-91cb1a5a5533	JPY	RETAIL_SALES	Japan Retail Sales	Japan Retail Sales Data	2024-12-27 08:30:00	0.1000	0.3000	0.3000	MEDIUM	BEARISH	62	-0.20	Ministry of Economy	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
d557e9f0-571e-4541-ae53-8ac0c1b3b079	JPY	GDP	Japan GDP Growth	Japan Gross Domestic Product Growth	2025-01-15 09:00:00	1.5000	0.8000	0.8000	MEDIUM	BULLISH	70	0.40	Bank of Japan	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
88287876-1382-4d42-ad57-4b3fe1b9eea3	JPY	INTEREST_RATE	BOJ Rate Decision	Bank of Japan Interest Rate Decision	2025-02-19 03:00:00	0.0000	-0.1000	-0.1000	HIGH	BULLISH	75	0.50	Bank of Japan	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
6904fdb1-010b-4c22-be43-aac928156b22	JPY	CPI	Japan CPI Data	Consumer Price Index for Japan	2025-03-18 08:30:00	1.2000	0.6000	0.6000	MEDIUM	BULLISH	72	0.30	Statistics Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
f54e0515-03e6-45a5-9617-c0c86fffa58b	JPY	EMPLOYMENT	Japan Employment Data	Japan Employment and Unemployment Data	2025-04-30 08:30:00	2.3000	2.7000	2.7000	MEDIUM	BULLISH	68	0.20	Statistics Bureau	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
9c948120-b99b-43b8-8d58-8515d6177a41	JPY	RETAIL_SALES	Japan Retail Sales	Japan Retail Sales Data	2025-05-29 08:30:00	0.5000	0.1000	0.1000	MEDIUM	BULLISH	65	0.30	Ministry of Economy	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
56ddc125-d562-4d06-91ae-98354330dd6c	GBP	EMPLOYMENT	UK Employment Data	UK Employment and Unemployment Data	2024-02-12 11:00:00	0.2000	0.1000	0.0000	MEDIUM	BULLISH	68	0.40	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
3f333518-6ded-4690-845b-71bf325b3b01	GBP	CPI	UK CPI Data	Consumer Price Index for United Kingdom	2024-03-20 09:30:00	0.3000	0.4000	0.2000	HIGH	NEUTRAL	55	0.00	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
477200a4-d93a-4bc0-85d9-d4ece882466f	GBP	INTEREST_RATE	BOE Rate Decision	Bank of England Interest Rate Decision	2024-04-11 12:00:00	5.2500	5.2500	5.2500	HIGH	NEUTRAL	50	0.00	Bank of England	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
49b9af89-2a00-43d0-97c5-bc4b8d6fd6a9	GBP	GDP	UK GDP Growth	United Kingdom Gross Domestic Product Growth	2024-05-10 09:30:00	0.3000	0.4000	0.2000	HIGH	NEUTRAL	52	0.00	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
657c0b99-2c23-4bb4-92f6-5884064ae187	GBP	RETAIL_SALES	UK Retail Sales	UK Retail Sales Data	2024-06-21 09:30:00	0.4000	0.2000	0.1000	MEDIUM	BULLISH	65	0.30	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
08bbcd5a-292f-410e-b19f-ca5e9657a14a	GBP	EMPLOYMENT	UK Employment Data	UK Employment and Unemployment Data	2024-07-16 11:00:00	0.1000	0.2000	0.2000	MEDIUM	BEARISH	58	-0.20	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
d1143c76-a3ad-46e8-9b05-30b29444b8c2	GBP	CPI	UK CPI Data	Consumer Price Index for United Kingdom	2024-08-21 09:30:00	0.1000	0.3000	0.3000	HIGH	BEARISH	70	-0.40	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
30ebd80e-9bc1-4e3a-93d5-d90b30e00d95	GBP	INTEREST_RATE	BOE Rate Decision	Bank of England Interest Rate Decision	2024-09-12 12:00:00	5.0000	5.2500	5.2500	HIGH	BULLISH	75	0.50	Bank of England	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
eedd48ea-7969-433b-a7c2-fada0e828cf0	GBP	GDP	UK GDP Growth	United Kingdom Gross Domestic Product Growth	2024-10-11 09:30:00	0.5000	0.3000	0.3000	HIGH	BULLISH	78	0.60	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a9dd67ec-ab1c-4256-b711-c0b0611e7d74	GBP	RETAIL_SALES	UK Retail Sales	UK Retail Sales Data	2024-11-22 09:30:00	0.6000	0.3000	0.4000	MEDIUM	BULLISH	72	0.40	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
72e9a5ec-70f4-41db-91bf-80f0af1c36cc	GBP	EMPLOYMENT	UK Employment Data	UK Employment and Unemployment Data	2024-12-17 11:00:00	0.3000	0.1000	0.1000	MEDIUM	BULLISH	68	0.30	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
59f0ab43-4984-4bc4-bd53-014cb7e13421	GBP	CPI	UK CPI Data	Consumer Price Index for United Kingdom	2025-01-22 09:30:00	0.4000	0.1000	0.1000	HIGH	BULLISH	80	0.70	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
19c029e3-2309-435a-b3ab-273f135c66ad	GBP	INTEREST_RATE	BOE Rate Decision	Bank of England Interest Rate Decision	2025-02-13 12:00:00	4.7500	5.0000	5.0000	HIGH	BULLISH	82	0.80	Bank of England	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a984c9a7-62b3-4557-95b3-e4ca4919fb23	GBP	GDP	UK GDP Growth	United Kingdom Gross Domestic Product Growth	2025-03-12 09:30:00	0.6000	0.3000	0.5000	HIGH	BULLISH	85	0.90	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
a5c79ba2-628b-44f1-8f1a-e573e6ee8948	GBP	RETAIL_SALES	UK Retail Sales	UK Retail Sales Data	2025-04-18 09:30:00	0.7000	0.3000	0.6000	MEDIUM	BULLISH	78	0.50	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
35ac4958-bd1e-4ca4-bfdf-a7c445807c11	GBP	EMPLOYMENT	UK Employment Data	UK Employment and Unemployment Data	2025-05-20 11:00:00	0.4000	0.1000	0.3000	MEDIUM	BULLISH	75	0.40	Office for National Statistics	\N	2025-08-08 21:22:19.985317	2025-08-08 21:22:19.985317
0ac12baa-b002-4d1a-aae4-ff64cf41fd4e	EUR	CPI	Eurozone CPI Data	Consumer Price Index for Eurozone	2025-08-08 23:00:00.839	0.3000	0.2000	0.1000	HIGH	BULLISH	85	0.80	Eurostat	\N	2025-08-08 23:00:00.913181	2025-08-08 23:00:00.913181
0c540a01-1bc9-4f81-b3cf-6fa78941041e	USD	INTEREST_RATE	Fed Rate Decision	Federal Reserve Interest Rate Decision	2025-08-08 23:00:00.839	5.2500	5.2500	5.2500	HIGH	BEARISH	72	-0.50	Federal Reserve	\N	2025-08-08 23:00:04.683018	2025-08-08 23:00:04.683018
9344e2de-9113-4aa9-be4e-173863fa842c	EUR	CPI	Eurozone CPI Data	Consumer Price Index for Eurozone	2025-08-08 23:05:00.119	0.3000	0.2000	0.1000	HIGH	BULLISH	85	0.80	Eurostat	\N	2025-08-08 23:05:00.16648	2025-08-08 23:05:00.16648
dbffde6c-6eed-43d4-9dff-245dcc23e845	USD	INTEREST_RATE	Fed Rate Decision	Federal Reserve Interest Rate Decision	2025-08-08 23:05:00.119	5.2500	5.2500	5.2500	HIGH	BEARISH	72	-0.50	Federal Reserve	\N	2025-08-08 23:05:00.206483	2025-08-08 23:05:00.206483
75f06e65-59af-4126-a587-b7408a907491	CAD	TEST	CAD Test Event	Testing CAD support	2025-08-09 12:21:02.66448	\N	\N	\N	HIGH	NEUTRAL	75	\N	Test	\N	2025-08-09 12:21:02.66448	2025-08-09 12:21:02.66448
cb4b7f29-12b9-4703-94c6-d878b4a5caa7	CAD	INTEREST_RATE	BOC Interest Rate Decision	Bank of Canada monetary policy decision	2025-08-09 14:00:00	5.0000	5.2500	5.2500	HIGH	BEARISH	88	-0.40	Bank of Canada	\N	2025-08-09 12:21:53.473554	2025-08-09 12:21:53.473554
df71315f-38dc-4f88-8a49-eec0b2532d07	CAD	EMPLOYMENT	Canada Employment Change	Monthly change in employed people in Canada	2025-08-08 12:30:00	25000.0000	15000.0000	10000.0000	HIGH	BULLISH	85	0.50	Statistics Canada	\N	2025-08-09 12:21:59.773749	2025-08-09 12:21:59.773749
7d869c9c-cae9-4007-9236-9b24bd7bfb6a	CAD	CPI	Canada Consumer Price Index	Canadian inflation rate	2025-08-07 08:30:00	2.1000	2.3000	2.5000	HIGH	BULLISH	82	0.30	Statistics Canada	\N	2025-08-09 12:22:05.82131	2025-08-09 12:22:05.82131
\.


--
-- Data for Name: sentiment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sentiment_history (id, currency, sentiment_date, sentiment, confidence_score, price_change, created_at) FROM stdin;
\.


--
-- Data for Name: user_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_alerts (id, user_id, currency, event_type, sentiment_threshold, email_notifications, push_notifications, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password_hash, preferences, created_at, updated_at) FROM stdin;
\.


--
-- Name: currency_sentiments currency_sentiments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_sentiments
    ADD CONSTRAINT currency_sentiments_pkey PRIMARY KEY (id);


--
-- Name: economic_events economic_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.economic_events
    ADD CONSTRAINT economic_events_pkey PRIMARY KEY (id);


--
-- Name: sentiment_history sentiment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sentiment_history
    ADD CONSTRAINT sentiment_history_pkey PRIMARY KEY (id);


--
-- Name: user_alerts user_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_alerts
    ADD CONSTRAINT user_alerts_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_currency_sentiments_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_currency_sentiments_currency ON public.currency_sentiments USING btree (currency);


--
-- Name: idx_currency_sentiments_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_currency_sentiments_updated ON public.currency_sentiments USING btree (last_updated);


--
-- Name: idx_economic_events_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_economic_events_currency ON public.economic_events USING btree (currency);


--
-- Name: idx_economic_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_economic_events_date ON public.economic_events USING btree (event_date);


--
-- Name: idx_economic_events_sentiment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_economic_events_sentiment ON public.economic_events USING btree (sentiment);


--
-- Name: idx_economic_events_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_economic_events_type ON public.economic_events USING btree (event_type);


--
-- Name: idx_sentiment_history_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sentiment_history_currency ON public.sentiment_history USING btree (currency);


--
-- Name: idx_sentiment_history_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sentiment_history_date ON public.sentiment_history USING btree (sentiment_date);


--
-- Name: idx_user_alerts_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_alerts_currency ON public.user_alerts USING btree (currency);


--
-- Name: idx_user_alerts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_alerts_user_id ON public.user_alerts USING btree (user_id);


--
-- Name: economic_events update_economic_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_economic_events_updated_at BEFORE UPDATE ON public.economic_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_alerts user_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_alerts
    ADD CONSTRAINT user_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

