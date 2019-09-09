'''
Optimization module
呼叫範例:
optModel(6, ['南港','新竹','台中','高雄'], 'C:/Users/cherc/Desktop/necsys/movetime.xlsx', 'C:/Users/cherc/Desktop/necsys/expectedCalls.xlsx',\
 'C:/Users/cherc/Desktop/necsys/historyCalls.xlsx', 'C:/Users/cherc/Desktop/necsys/SiteInfo.xlsx')
'''
import pandas as pd
from sklearn.linear_model import LinearRegression
from gurobipy import *
import numpy as np

# regression: history calls and employees
def reg(df_historyCalls):
    X_reg = df_historyCalls['總服務次數'].values.reshape(-1, 1)
    y_reg = df_historyCalls['員工數'].values
    reg = LinearRegression().fit(X_reg, y_reg)
    g = reg.coef_[0]
    s = reg.intercept_

    return g, s

def updateSLAtable(df_reachable, df_needAdjust): 

    sites = df_reachable.columns
    for a in range(len(df_needAdjust)):
        i = np.where(siteName == df_needAdjust['manaulAdjust'].iloc[a])
        df_reachable[df_reachable2['客戶ID'] == df_needAdjust['CustomerID']][sites[i]] == True

    return df_reachable
    

def optModel(oilprice, reservationSite, df_reachable, df_needAdjustOK, movetimePath, expectedCallsPath, historyCallsPath, siteInfoPath):
    '''
    <input>
    oilprice: float, 
    reservationSite: list, 
    df_reachable: 客戶服務水準滿足表
    df_needAdjustOK: 
    movetimePath, expectedCallsPath, historyCallsPath, siteInfoPath: path
    <output>
    df_site: table
    dict_assign: dictionary
    '''

    # read data files
    df_movetime = pd.read_excel(movetimePath)
    df_expectedCalls = pd.read_excel(expectedCallsPath) 
    df_historyCalls = pd.read_excel(historyCallsPath)  
    df_siteInfo = pd.read_excel(siteInfoPath)
    siteName = df_siteInfo['據點'].values
    customerID = df_expectedCalls['客戶ID'].values

    
    # update 客戶表
    df_reachableOK = updateSLAtable(df_reachable, df_needAdjustOK)

    # Parameter processing
    M = df_siteInfo['最大容納人數'].values
    c = df_siteInfo['每人年成本'].values
    f = df_siteInfo[['前進據點成本','固定據點成本']].values
    h = df_expectedCalls['預期年服務次數'].values
    d = df_movetime[df_movetime.columns[4:]].values
    A = df_reachableOK[df_reachableOK.columns[4:]].values
    
    numofSite = len(df_siteInfo)
    numofCustomer = len(df_expectedCalls)

    g, s = reg(df_historyCalls)

    for site in reservationSite:
        if site

    scales=[0,1]
    locations=[i for i in range(numofSite)]
    customers=[i for i in range(numofCustomer)]

    # model
    model = Model('Integer Program')

    # variable
    x = model.addVars(locations, scales, vtype=GRB.BINARY, name='x')
    y = model.addVars(customers, locations, vtype=GRB.BINARY, name='y')
    w = model.addVars(locations, vtype=GRB.INTEGER, name='w')

    # constraints
    model.addConstrs(y[i,j] <= quicksum(x[j,k] for k in scales) for i in customers for j in locations)
    model.addConstrs(quicksum(x[j,k] for k in scales) <= 1 for j in locations)
    model.addConstrs(quicksum(A[i,j]*y[i,j] for j in locations) == 1 for i in customers)
    model.addConstrs(w[j] <= x[j,0]+M[j]*x[j,1] for j in locations)
    model.addConstrs(w[j] >= x[j,0]+x[j,1] for j in locations)
    model.addConstrs(w[j] >= g*(quicksum(h[i]*y[i,j] for i in customers))+s for j in locations)
    model.addConstrs(x[j,1] == 1 for j in reservationSite) 
                
    # update model
    model.update()

    # objective function: minimize total cost
    obj = quicksum(h[i]*oilprice*d[i,j]*y[i,j] for i in customers for j in locations)+quicksum(f[j,1]*x[j,1] for j in locations)+quicksum(c[j]*w[j] for j in locations)
    model.setObjective(obj, GRB.MINIMIZE)

    # solve
    model.optimize()

    # outcome display
    siteScale = []
    assignSite = []
    siteEmp = []
    for v in model.getVars():
    #     print('%s %g' % (v.varName, v.x))
        if v.x == 1:
            var_result = v.Varname
            if var_result[0] == 'x':
                siteScale.append(int((var_result.split(','))[-1].strip(']')))
            if var_result[0] == 'y':
                assignSite.append(int((var_result.split(','))[-1].strip(']')))
        if v.Varname[0] == 'w':
            siteEmp.append(int(v.x))

    df_site = pd.DataFrame(siteName, columns = ['siteName'])

    df_site['scale'] = siteScale
    df_site['numofEmp'] = siteEmp

    assignSiteName = []
    for a in assignSite:
        assignSiteName.append(siteName[a])
    df_assign = pd.DataFrame(customerID,columns=['customerID'])
    df_assign['assignSite'] = assignSiteName
    dict_assign = {}
    for site in siteName:
        dict_assign[site]=df_assign[df_assign['assignSite']==site]
        
    return df_site, dict_assign





