"""
Advanced Data Analysis Views
Uses pandas, numpy, scipy for powerful data processing
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import numpy as np
from scipy import stats
from io import BytesIO, StringIO
import base64
import json


@api_view(['POST'])
def analyze_csv(request):
    """
    Comprehensive CSV data analysis with pandas
    """
    try:
        csv_data = request.data.get('csv')

        # Parse CSV
        df = pd.read_csv(StringIO(csv_data))

        analysis = {
            'success': True,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'missing_values': df.isnull().sum().to_dict(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'numeric_summary': {},
            'categorical_summary': {}
        }

        # Numeric columns analysis
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            analysis['numeric_summary'][col] = {
                'mean': float(df[col].mean()),
                'median': float(df[col].median()),
                'std': float(df[col].std()),
                'min': float(df[col].min()),
                'max': float(df[col].max()),
                'q1': float(df[col].quantile(0.25)),
                'q3': float(df[col].quantile(0.75))
            }

        # Categorical columns analysis
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            value_counts = df[col].value_counts()
            analysis['categorical_summary'][col] = {
                'unique_values': int(df[col].nunique()),
                'top_values': value_counts.head(10).to_dict(),
                'mode': str(df[col].mode()[0]) if not df[col].mode().empty else None
            }

        return Response(analysis)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def convert_csv_to_json(request):
    """
    Convert CSV to JSON format
    """
    try:
        csv_data = request.data.get('csv')
        orient = request.data.get('orient', 'records')  # records, split, index, columns, values

        df = pd.read_csv(StringIO(csv_data))
        json_data = df.to_json(orient=orient)

        return Response({
            'success': True,
            'json': json.loads(json_data),
            'rows': len(df)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def convert_json_to_csv(request):
    """
    Convert JSON to CSV format
    """
    try:
        json_data = request.data.get('json')

        # Handle both JSON string and dict
        if isinstance(json_data, str):
            json_data = json.loads(json_data)

        df = pd.DataFrame(json_data)
        csv_data = df.to_csv(index=False)

        return Response({
            'success': True,
            'csv': csv_data,
            'rows': len(df),
            'columns': len(df.columns)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def data_statistics(request):
    """
    Advanced statistical analysis on numeric data
    """
    try:
        data = request.data.get('data', [])

        arr = np.array(data, dtype=float)

        statistics = {
            'success': True,
            'count': len(arr),
            'mean': float(np.mean(arr)),
            'median': float(np.median(arr)),
            'mode': float(stats.mode(arr, keepdims=True).mode[0]) if len(arr) > 0 else None,
            'std': float(np.std(arr)),
            'variance': float(np.var(arr)),
            'min': float(np.min(arr)),
            'max': float(np.max(arr)),
            'range': float(np.ptp(arr)),
            'q1': float(np.percentile(arr, 25)),
            'q2': float(np.percentile(arr, 50)),
            'q3': float(np.percentile(arr, 75)),
            'iqr': float(np.percentile(arr, 75) - np.percentile(arr, 25)),
            'skewness': float(stats.skew(arr)),
            'kurtosis': float(stats.kurtosis(arr)),
            'sum': float(np.sum(arr))
        }

        return Response(statistics)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def correlation_analysis(request):
    """
    Calculate correlation between columns in dataset
    """
    try:
        csv_data = request.data.get('csv')
        method = request.data.get('method', 'pearson')  # pearson, spearman, kendall

        df = pd.read_csv(StringIO(csv_data))
        numeric_df = df.select_dtypes(include=[np.number])

        if numeric_df.empty:
            return Response({
                'success': False,
                'error': 'No numeric columns found in the data'
            }, status=status.HTTP_400_BAD_REQUEST)

        correlation_matrix = numeric_df.corr(method=method)

        return Response({
            'success': True,
            'correlation_matrix': correlation_matrix.to_dict(),
            'method': method,
            'columns': correlation_matrix.columns.tolist()
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def detect_outliers(request):
    """
    Detect outliers using IQR method
    """
    try:
        data = request.data.get('data', [])
        column_name = request.data.get('column', 'value')

        arr = np.array(data, dtype=float)

        q1 = np.percentile(arr, 25)
        q3 = np.percentile(arr, 75)
        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outliers = arr[(arr < lower_bound) | (arr > upper_bound)]
        outlier_indices = np.where((arr < lower_bound) | (arr > upper_bound))[0]

        return Response({
            'success': True,
            'outliers': outliers.tolist(),
            'outlier_indices': outlier_indices.tolist(),
            'outlier_count': len(outliers),
            'lower_bound': float(lower_bound),
            'upper_bound': float(upper_bound),
            'iqr': float(iqr)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def normalize_data(request):
    """
    Normalize data using various methods
    """
    try:
        data = request.data.get('data', [])
        method = request.data.get('method', 'minmax')  # minmax, zscore, robust

        arr = np.array(data, dtype=float).reshape(-1, 1)

        if method == 'minmax':
            from sklearn.preprocessing import MinMaxScaler
            scaler = MinMaxScaler()
            normalized = scaler.fit_transform(arr).flatten()
        elif method == 'zscore':
            from sklearn.preprocessing import StandardScaler
            scaler = StandardScaler()
            normalized = scaler.fit_transform(arr).flatten()
        elif method == 'robust':
            from sklearn.preprocessing import RobustScaler
            scaler = RobustScaler()
            normalized = scaler.fit_transform(arr).flatten()
        else:
            return Response({
                'success': False,
                'error': f'Unknown normalization method: {method}'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'normalized_data': normalized.tolist(),
            'method': method,
            'original_count': len(data)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def clean_data(request):
    """
    Clean CSV data - remove duplicates, handle missing values
    """
    try:
        csv_data = request.data.get('csv')
        remove_duplicates = request.data.get('remove_duplicates', True)
        fill_method = request.data.get('fill_method', 'drop')  # drop, mean, median, mode, forward, backward

        df = pd.read_csv(StringIO(csv_data))

        original_rows = len(df)

        # Remove duplicates
        if remove_duplicates:
            df = df.drop_duplicates()

        # Handle missing values
        if fill_method == 'drop':
            df = df.dropna()
        elif fill_method == 'mean':
            df = df.fillna(df.mean(numeric_only=True))
        elif fill_method == 'median':
            df = df.fillna(df.median(numeric_only=True))
        elif fill_method == 'mode':
            df = df.fillna(df.mode().iloc[0])
        elif fill_method == 'forward':
            df = df.fillna(method='ffill')
        elif fill_method == 'backward':
            df = df.fillna(method='bfill')

        cleaned_csv = df.to_csv(index=False)

        return Response({
            'success': True,
            'csv': cleaned_csv,
            'original_rows': original_rows,
            'cleaned_rows': len(df),
            'rows_removed': original_rows - len(df),
            'fill_method': fill_method
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def group_aggregate(request):
    """
    Group and aggregate data
    """
    try:
        csv_data = request.data.get('csv')
        group_by = request.data.get('group_by', [])
        agg_columns = request.data.get('agg_columns', {})  # {column: operation}

        if not group_by or not agg_columns:
            return Response({
                'success': False,
                'error': 'group_by and agg_columns are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        df = pd.read_csv(StringIO(csv_data))

        grouped = df.groupby(group_by).agg(agg_columns).reset_index()
        result_csv = grouped.to_csv(index=False)

        return Response({
            'success': True,
            'csv': result_csv,
            'rows': len(grouped),
            'columns': len(grouped.columns)
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def pivot_table(request):
    """
    Create pivot table from data
    """
    try:
        csv_data = request.data.get('csv')
        index = request.data.get('index', None)
        columns = request.data.get('columns', None)
        values = request.data.get('values', None)
        aggfunc = request.data.get('aggfunc', 'mean')

        df = pd.read_csv(StringIO(csv_data))

        pivot = pd.pivot_table(
            df,
            index=index,
            columns=columns,
            values=values,
            aggfunc=aggfunc,
            fill_value=0
        )

        result_csv = pivot.to_csv()

        return Response({
            'success': True,
            'csv': result_csv,
            'pivot_table': pivot.to_dict()
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
