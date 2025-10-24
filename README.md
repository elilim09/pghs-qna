# Pangyo High School Q&A Web App

This is a web application that provides a Q&A chatbot service for Pangyo High School.

## Overview

This project aims to provide information about Pangyo High School through a chatbot interface. The chatbot answers questions based on a knowledge base extracted from official school documents.

### Backend configuration

- By default the web app generates answers locally from the bundled knowledge base, so it works even when an external AI API is unreachable.
- To connect an external FastAPI server, expose it publicly and set `REACT_APP_API_BASE_URL` before building the frontend (for example `REACT_APP_API_BASE_URL=https://your-domain.example`).
- The frontend will automatically fall back to the local knowledge base if the remote API call fails.

## Kakao 1:1 Chatbot

[Kakao Link](http://pf.kakao.com/_YhhDn/friend)

## Web Site

[Pangyo QNA Web Link](https://pghs-qna.web.app/)