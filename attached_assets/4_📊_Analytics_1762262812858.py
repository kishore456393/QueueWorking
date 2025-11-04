import streamlit as st
import pandas as pd
import sqlite3

st.title('📊 Analytics')
st.markdown('Historical queue trends and performance insights.')

try:
    conn = sqlite3.connect('data/queue_data.db')
    df = pd.read_sql_query('SELECT * FROM queue_stats', conn)
    st.dataframe(df)
    st.line_chart(df.set_index('timestamp')['queue_length'])
except Exception as e:
    st.warning('No historical data found.')
