import streamlit as st
import pandas as pd
import sys
import os
import json

# Add project root to sys.path to import tools
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(project_root)

try:
    from tools.tool_parse_excel import normalize_dataframe
    from tools.tool_analyze_finances import analyze
except ImportError as e:
    st.error(f"Error importing tools: {e}. Make sure you are running this from the correct directory or that the environment is set up correctly.")
    st.stop()

st.set_page_config(page_title="Financial Data Staging", layout="wide")

st.title("Financial Analysis - Staging & Approval")

# --- Phase 1: File Upload ---
st.header("1. Upload Financial Data")
uploaded_file = st.file_uploader("Upload an Excel file", type=["xlsx", "xls"])

if uploaded_file:
    try:
        # Load Excel file without parsing all sheets immediately
        xls = pd.ExcelFile(uploaded_file)
        sheet_names = xls.sheet_names
        
        if "sheet_decisions" not in st.session_state:
            st.session_state["sheet_decisions"] = {sheet: "Skip" for sheet in sheet_names}

        # --- Phase 2: The Staging Area ---
        st.header("2. Staging Area (Review)")
        st.info(f"Detected {len(sheet_names)} sheets. Please review and select action.")

        # Create a container for the staging area
        with st.container():
            for sheet in sheet_names:
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    with st.expander(f"Sheet: {sheet}", expanded=False):
                        # Preview first 5 rows
                        df_preview = pd.read_excel(uploaded_file, sheet_name=sheet, nrows=5)
                        st.dataframe(df_preview)
                
                with col2:
                    current_decision = st.session_state["sheet_decisions"].get(sheet, "Skip")
                    decision = st.radio(
                        f"Action for {sheet}",
                        ["Import", "Skip"],
                        index=0 if current_decision == "Import" else 1,
                        key=f"radio_{sheet}",
                        horizontal=True
                    )
                    st.session_state["sheet_decisions"][sheet] = decision

        # --- Phase 3: Processing ---
        st.header("3. Finalize Import")
        
        # Calculate how many sheets are selected
        selected_sheets = [s for s, d in st.session_state["sheet_decisions"].items() if d == "Import"]
        
        if st.button("Finalize Import", type="primary", disabled=len(selected_sheets) == 0):
            if not selected_sheets:
                st.warning("No sheets selected for import.")
            else:
                st.success(f"Processing {len(selected_sheets)} sheets...")
                
                all_results = []
                
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                for idx, sheet in enumerate(selected_sheets):
                    status_text.text(f"Processing sheet: {sheet}...")
                    
                    try:
                        # 1. Parse/Normalize
                        df = pd.read_excel(uploaded_file, sheet_name=sheet)
                        normalized_data = normalize_dataframe(df)
                        
                        if "error" in normalized_data:
                            st.error(f"Error normalizing sheet {sheet}: {normalized_data['error']}")
                            continue
                            
                        # 2. Analyze
                        analysis_result = analyze(normalized_data)
                        
                        all_results.append({
                            "sheet": sheet,
                            "normalized": normalized_data,
                            "analysis": analysis_result
                        })
                        
                    except Exception as e:
                        st.error(f"Error processing sheet {sheet}: {str(e)}")
                    
                    progress_bar.progress((idx + 1) / len(selected_sheets))
                
                status_text.text("Processing complete!")
                
                # Display Results
                st.divider()
                st.subheader("Analysis Results")
                
                for res in all_results:
                    with st.expander(f"Results for: {res['sheet']}", expanded=True):
                        
                        kpis = res['analysis'].get('kpis', {})
                        improvements = res['analysis'].get('improvements', [])
                        
                        # Display KPIs
                        c1, c2, c3, c4 = st.columns(4)
                        c1.metric("Total Sales", f"${kpis.get('total_sales', 0):,.0f}")
                        c2.metric("Cost of Sales", f"${kpis.get('cost_of_sales', 0):,.0f}")
                        c3.metric("Net Income", f"${kpis.get('net_income', 0):,.0f}")
                        c4.metric("Gross Margin", f"{kpis.get('ratios', {}).get('gross_margin_pct', 0)}%")
                        
                        # Display Improvements
                        if improvements:
                            st.write("#### Detected Improvements")
                            for imp in improvements:
                                severity_color = "red" if imp.get('severity') == "HIGH" else "orange"
                                st.markdown(f":{severity_color}[**{imp.get('title')}**]")
                                st.write(imp.get('message'))
                                st.info(f"Action: {imp.get('actionable_step')}")
                        else:
                            st.write("No specific improvements detected.")

                        # Raw JSON Option
                        with st.expander("View Raw Analysis JSON"):
                            st.json(res['analysis'])

    except Exception as e:
        st.error(f"Error reading file: {e}")
