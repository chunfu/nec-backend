# -*- coding: UTF-8 -*-

'''
SLA module
呼叫範例:
SLAcheck(90, 'C:/Users/cherc/Desktop/necsys/movetime.xlsx') 
'''
import pandas as pd

def SLAcheck(minSLA, movetimePath):
    '''
    <input>
    minSLA: int
    movetimePath: path 
    <output>
    df_needAdjust: a table of customers who need to manual assign, contain three columns 'CustomerID', 'CustomerName', 'CustomerAddress'
    df_reachable: a table of customers to site office which could satisfy SLA or not, (True or False in each cell)
    '''

    df_movetime = pd.read_excel(movetimePath)
    df_tempfilter = df_movetime[df_movetime.columns[3:]].astype('int')<minSLA
    df_reachable = pd.concat([df_movetime[df_movetime.columns[:3]], df_tempfilter],axis=1)
    needAdjust = []
    # 列出所有都是False的客戶
    for customer in df_reachable.values:
        if True in customer:
            continue
        else: 
            needAdjust.append([customer[0],customer[1],customer[2]])
    
    df_needAdjust = pd.DataFrame(needAdjust, columns=['CustomerID', 'CustomerName', 'CustomerAddress'], copy=True)
    # print(df_needAdjust)

    return df_needAdjust.to_excel('../docs/needAdjust.xlsx', encoding='utf-8', index=False), df_reachable.to_excel('../docs/reachable.xlsx', encoding='utf-8', index=False)

# def updateSLAtable(df_reachable, df_needAdjust):


