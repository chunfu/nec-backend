'''
Optimization module
呼叫範例:
optModel(6, [1,2,3], 'C:/Users/cherc/Desktop/necsys/movetime.xlsx', 'C:/Users/cherc/Desktop/necsys/expectedCalls.xlsx',\
 'C:/Users/cherc/Desktop/necsys/historyCalls.xlsx', 'C:/Users/cherc/Desktop/necsys/SiteInfo.xlsx')
'''
import pandas as pd
from sklearn.linear_model import LinearRegression
from gurobipy import *

# regression: history calls and employees
def reg(df_historyCalls):
    X_reg = df_historyCalls['總服務次數'].values.reshape(-1, 1)
    y_reg = df_historyCalls['員工數'].values
    reg = LinearRegression().fit(X_reg, y_reg)
    g = reg.coef_[0]
    s = reg.intercept_

    return g, s

def updateSLAtable(df_reachable, df_needAdjustOK, df_officeMapping): 
    for idx in df_needAdjustOK.index:

        cusID = df_needAdjustOK['CustomerID'].iloc[idx]
        loc = df_needAdjustOK['location'].iloc[idx]
        mapping_idx = df_officeMapping.index[df_officeMapping['name']==loc].tolist()[0]
        cus_Site = df_officeMapping['name'].iloc[mapping_idx]
        cus_idx = df_reachable.index[df_reachable['客戶ID']==cusID].tolist()[0]           
        df_reachable[cus_Site].iloc[cus_idx] = True
        
    return df_reachable


def optModel(oilprice, reservationSite, reachablePath, needAdjustOKPath, movetimePath, expectedCallsPath, historyCallsPath, siteInfoPath, officeMappingPath):
    '''
    <input>
    oilprice: float
    reservationSite: list
    reachablePath: 客戶服務水準滿足表
    needAdjustOKPath: 
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
    df_officeMapping = pd.read_excel(officeMappingPath)
    df_reachable = pd.read_excel(reachablePath)
    df_needAdjustOK = pd.read_excel(needAdjustOKPath)
    siteName = df_siteInfo['據點'].values
    customerID = df_expectedCalls['客戶ID'].values
    df_movetime.astype({'客戶ID': 'str'}).dtypes

    
    # update 客戶表
    df_reachableOK = updateSLAtable(df_reachable, df_needAdjustOK, df_officeMapping)

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

    scales=[0,1]
    locations=[i for i in range(numofSite)]
    customers=[i for i in range(numofCustomer)]

    # 保留據點: 將簡稱對應到index 
    reservationSite_idx = []
    for rsvSite in reservationSite:
        reservationSite_idx.append(df_officeMapping.index[df_officeMapping['name']==rsvSite].tolist()[0])


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
    model.addConstrs(x[j,1] == 1 for j in reservationSite_idx) 
                
    # update model
    model.update()

    # objective function: minimize total cost
    obj = quicksum(h[i]*oilprice*d[i,j]*y[i,j] for i in customers for j in locations)+quicksum(f[j,1]*x[j,1] for j in locations)+quicksum(c[j]*w[j] for j in locations)
    model.setObjective(obj, GRB.MINIMIZE)

    # solve
    model.optimize()

    # outcome display
    siteScale = ['不蓋據點' for i in range(numofSite)]
    assignSite = []
    siteEmp = []

    count=0 
    for v in model.getVars():
    #     print('%s %g' % (v.varName, v.x))
        var_result = v.Varname
        if v.x == 1:
            if var_result[0] == 'x':
                if int(var_result.split(',')[-1].strip(']')) == 0:
                    siteScale[int(count/2)] = '前進據點'
                elif int(var_result.split(',')[-1].strip(']')) == 1:
                    siteScale[int(count/2)] = '固定據點'
            if var_result[0] == 'y':
                assignSite.append(int((var_result.split(','))[-1].strip(']')))
        if var_result[0] == 'w':
            siteEmp.append(int(v.x))
        if count < numofSite*2:
            count = count+1

    df_site = pd.DataFrame(siteName, columns = ['據點'])

    df_site['規模'] = siteScale
    df_site['員工數'] = siteEmp

    assignSiteName = []
    for a in assignSite:
        assignSiteName.append(siteName[a])
    df_assign = pd.DataFrame(customerID, columns=['客戶ID'])
    df_assign['指派據點'] = assignSiteName
    dict_assign = {}
    for site in siteName:
        dict_assign[site]=df_assign[df_assign['指派據點']==site]

	setCost = [0 for i in range(numofSite)]
	empCost = [0 for i in range(numofSite)]
	serviceCost = [0 for i in range(numofSite)]
	totalCost = [0 for i in range(numofSite)]
	annualCalls = [0 for i in range(numofSite)]

	for i in range(len(siteName)):
	    site = siteName[i]
	    if df_site['規模'][df_site.index[df_site['據點']==site].tolist()[0]] != '不蓋據點':
	        sCost = 0
	        for j in range(len(dict_assign[site]['客戶ID'])):
	            cusid = dict_assign[site]['客戶ID'].iloc[j]
	            cusidx = df_movetime.index[df_movetime['客戶ID']==cusid].tolist()[0] 
	            mt = df_movetime[site].iloc[cusidx]
	            sCost += mt*oilprice
	
	        serviceCost[i] = round(sCost)
	# 增加各據點每年總服務次數 = 加總客戶預期服務次數
	for i in range(len(siteName)):
	    sumofCalls = 0
	    for cus in dict_assign[siteName[i]]['客戶ID']:
	        sumofCalls += float(df_expectedCalls['預期年服務次數'][df_expectedCalls.index[df_expectedCalls['客戶ID']==cus].tolist()[0]])
	    annualCalls[i] = round(sumofCalls)
	
	df_site['建置成本($)']=setCost
	df_site['服務成本($)']=serviceCost
	df_site['員工成本($)']=empCost
	df_site['總成本($)']=totalCost
	df_site['年度總服務次數']=annualCalls

	for idx in df_site.index:
	    if df_site['規模'].iloc[idx] == '固定據點':
	        df_site['建置成本($)'].iloc[idx] = int(round(df_SiteInfo['固定據點成本'].iloc[idx]))
	    elif df_site['規模'].iloc[idx] == '前進據點':
	        df_site['建置成本($)'].iloc[idx] = int(round(df_SiteInfo['前進據點成本'].iloc[idx]))
	    else:
	        df_site['建置成本($)'].iloc[idx] = 0
	    
	    df_site['員工成本($)'].iloc[idx] = int(round(df_site['員工數'].iloc[idx]*df_SiteInfo['每人年成本'].iloc[idx]))
	        
	    df_site['總成本($)'].iloc[idx] = int(round(df_site['建置成本($)'].iloc[idx]+df_site['員工成本($)'].iloc[idx]+df_site['服務成本($)'].iloc[idx]))
 
	 for idx in df_site.index:
	    df_site['建置成本($)'].iloc[idx] = format(df_site['建置成本($)'].iloc[idx], ',')
	    df_site['員工成本($)'].iloc[idx] = format(df_site['員工成本($)'].iloc[idx], ',')
	    df_site['服務成本($)'].iloc[idx] = format(df_site['服務成本($)'].iloc[idx], ',')
	    df_site['總成本($)'].iloc[idx] = format(df_site['總成本($)'].iloc[idx], ',')
	    df_site['年度總服務次數'].iloc[idx] = format(df_site['年度總服務次數'].iloc[idx], ',')
    
        
    df_assign.to_excel('assign.xlsx', encoding='utf-8', index=False)
    return df_site.to_excel('site.xlsx', encoding='utf-8', index=False), dict_assign





