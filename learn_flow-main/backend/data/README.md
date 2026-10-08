# Catalog source files

Keep `videos_final.csv` and `pdfs_final.csv` outside version control because the PDF URLs contain access tokens.

Point `VIDEOS_CSV` and `PDFS_CSV` in `backend/.env` to the local files, then run:

```bash
npm run import:data
```
