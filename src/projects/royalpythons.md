---
title: Regal Pythons
order: 4
status: active
stack:
  - Contentful
  - Glomr
  - AWS Lambda
  - S3
links:
 - url: https://www.regalpythons.com
   label: Website
summary: A friend asked me to produce a website showcasing the exoctic ball pythons they breed and sell
---

This was an interesting project as the site owner breeds exceptional animals and is an excellent photographer. Implementation harks back to a time when headless CMS systems were all the rage and I wanted to try out building a site that the owner can operate content on without needing a full blown CMS.

This actually used [glomr](/projects/glomr) for the first time as a static site builder and the pipeline triggers an AWS lambda from contentful with a webhook and ships to S3

