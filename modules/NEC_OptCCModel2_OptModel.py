# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_OptModel_module

Input ex:
    OptModel(4, 3, 30, 2.42, 173700.0, 800.0, 6.0, 4.0, '嘉義', 
    'C:\\Users\\User\\Desktop\\190923_NEC_system\\Input_DATA\\TW_TXcars_cost.xlsx',
    'C:\\Users\\User\\Desktop\\190923_NEC_system\\Output_DATA_CYex\\CY_PathDist_analy.xlsx')
"""
# packages import
import pandas as pd
import numpy as np
#import gurobi
from gurobipy import *

def OptModel(CCcars_num, PCcars_num, works_buffer, CCcars_Fuel, CCcars_Rent, basic_Mileage, below_PCcarsFuel, upper_PCcarsFuel, office, TXcost_File, loc_PathFile):

    '''
    <input>
    CCcars_num: int                   # company_car_numbers
    PCcars_num: int                   # private_car_numbers
    works_buffer: int                 # works_between_buffer_mins
    CCcars_Fuel: float                # company_car_fuel_cost_$/km
    CCcars_Rent: float                # company_car_yearly_rental_cost_$/car
    basic_Mileage: float              # private_car_monthly_basic_Mileage_km
    below_PCcarsFuel: float           # private_car_below_basicM_fuel_cost_$/km
    upper_PCcarsFuel: flost           # private_car_upper_basicM_fuel_cost_$/km
    office: string                    
    TXcost_File: string [file path]  
    loc_PathFile: string [file path]  ### df_loc_PathDist_analy
    
    <output>
    df_loc_DailyAssign_detail: dataframe (table), each CCcar_num whole year DailyAssign cost (each day result)
    df_loc_DailyAssign_cost: dataframe (table), each CCcar_num whole year DailyAssign cost (whole year result)
    
    '''
    
    TXcost_Data = pd.read_excel(TXcost_File)
    
    office_EGnm = TXcost_Data.loc[TXcost_Data.actgr_office == office]['actgr'].item()
    TXcars_start_M = TXcost_Data.loc[TXcost_Data.actgr_office == office]['initial_TXmileage(m)'].item()	# taxi_car_basic_Mileage_m
    initial_TXcars = TXcost_Data.loc[TXcost_Data.actgr_office == office]['initial_Txcost($)'].item()	# taxi_car_basic_cost_$
    add_TXcars = TXcost_Data.loc[TXcost_Data.actgr_office == office]['add_Txcost($/km)'].item()			# taxi_car_addtional_cost_$/km
    
    loc_PathData = pd.read_excel(loc_PathFile)
    
    
    ########### create loc param table
    servDay = list(set(loc_PathData['Out_Day']))
    servDay.sort()
    numDay = len(servDay)
    
    loc_param_data = np.zeros(( 9, numDay))
    loc_param = pd.DataFrame(loc_param_data, columns = servDay, index = ['param_m','param_p','param_n','param_W','param_S','param_M','param_T','param_B','param_Mlimit'])
    
    for day in servDay:
        #day = servDay[2]
        loc_DayPath = loc_PathData.loc[loc_PathData['Out_Day'] == day]
        min_beginTime = loc_DayPath['Begin_Time(secs)'].min()
        min_endTime = loc_DayPath['End_Time(secs)'].min()
        indexset = list(loc_DayPath.index)
        
        ### param m & p & n
        m = CCcars_num  
        p = PCcars_num  
        n = len(indexset)
        loc_param.loc['param_m', day] = m
        loc_param.loc['param_p', day] = p
        loc_param.loc['param_n', day] = n
        
        ### param W & S & M
        W = list()
        S = list()
        M = list()
        for path_index in indexset:
            path_endTime = loc_DayPath.loc[path_index, 'End_Time(secs)'] - min_endTime
            path_beginTime = loc_DayPath.loc[path_index, 'Begin_Time(secs)'] - min_beginTime
            path_moveTime = loc_DayPath.loc[path_index, 'PathTol_MoveDist(km)']
            W.append(str(path_endTime))
            S.append(str(path_beginTime))
            M.append(str(path_moveTime))
        loc_param.loc['param_W', day] = ','.join(W)
        loc_param.loc['param_S', day] = ','.join(S)
        loc_param.loc['param_M', day] = ','.join(M)
    	
    	### param T & B & Mlimit
        T = works_buffer
        loc_param.loc['param_T', day] = T
        B = 1000000 
        loc_param.loc['param_B', day] = B
        Mlimit = 100000
        loc_param.loc['param_Mlimit', day] = Mlimit
    	
    ########### OptModel
    runCar_start = 0
    runCar_end = CCcars_num*2+1
    
    # loc yearly Total_cost_analysis data
    loc_CostAnaly_data = np.zeros((runCar_end, 7))
    df_loc_DailyAssign_cost = pd.DataFrame(loc_CostAnaly_data ,columns=['CCcars_num','FixedCost_rent','CCcars_fuel','PCcars_fuel','TXcars_fuel','VarCost_fuel','TotalCost'])
    df_loc_DailyAssign_cost['CCcars_num'] = range(runCar_start, runCar_end)
    
    for CCcars_now in range(runCar_start, runCar_end):
        # loc daily_Mileage data
        loc_TolWDays = numDay
        loc_DailyAssign_data = np.zeros((loc_TolWDays, 10))
        loc_DailyAssign_df = pd.DataFrame(loc_DailyAssign_data,columns=['Work_date','CCcars_num','CCcars_mileage', 'PCcars_mileage','TXcars_mileage', 'Tol_mileage','CCcars_fuel', 'PCcars_fuel','TXcars_fuel','Tol_fuel'])
        
        # basic setting
        index_df = 0
        
    	# daily run for one year
        for d in servDay: 
            # reassign accu_Prvfuel every month
            WorkDay = str(d)
            if WorkDay[-1] == "1" and WorkDay[-2] == "0":
                accu_PCcarsMileage = 0.0 
            
    		# model param setting
            m = int(loc_param.loc['param_m', d])
            p = int(loc_param.loc['param_p', d])
            n = int(loc_param.loc['param_n', d])
            B = int(loc_param.loc['param_B', d])
            T = int(loc_param.loc['param_T', d])
            Mlimit = int(loc_param.loc['param_Mlimit', d])
    		
            W = dict()
            S = dict()
            M = dict()
            Total_M = 0.0
            ls_W = loc_param.loc['param_W', d].split(',')
            ls_S = loc_param.loc['param_S', d].split(',')
            ls_M = loc_param.loc['param_M', d].split(',')
            for j in range(n):
                n_index = j+1
                W[n_index] = int(ls_W[j])
                S[n_index] = int(ls_S[j])
                M[n_index] = float(ls_M[j])
                Total_M = Total_M + M[n_index]
    
            cars = range(1,CCcars_now+p+1)
            CCcars = range(1,CCcars_now+1)
            PCcars = range(CCcars_now+2,CCcars_now+p+1)
            jobs = range(1,n+1)				
            
            # model
            model = Model('NEC_model_EXTENS')
            model.Params.OutputFlag = 0
            
            # variable
            jobs_pairs =  [(j1,j2) for j1 in jobs for j2 in jobs if j1 != j2]
            X = model.addVars(CCcars, jobs, vtype=GRB.BINARY, name="X")		# CCcars or not
            Y = model.addVars(PCcars, jobs, vtype=GRB.BINARY, name="Y")		# PCcars or not
            ZC = model.addVars(cars, jobs_pairs, vtype=GRB.BINARY, name="ZC")		# works on CCcars/PCcars
            ZP = model.addVars(cars, jobs_pairs, vtype=GRB.BINARY, name="ZP")		# works on CCcars/PCcars
            
            # constraints
            ST1 = model.addConstrs((ZC[i, j1, j2] + ZC[i, j2, j1] <= 1 for i in CCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST1")
            ST2 = model.addConstrs((ZP[i, j1, j2] + ZP[i, j2, j1] <= 1 for i in PCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST2")
            ST3 = model.addConstrs((ZC[i, j1, j2]  <= X[i, j1] for i in CCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST3")
            ST4 = model.addConstrs((ZP[i, j1, j2]  <= Y[i, j1] for i in PCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST4")
            ST5 = model.addConstrs((ZC[i, j1, j2]  <= X[i, j2] for i in CCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST5")
            ST6 = model.addConstrs((ZP[i, j1, j2]  <= Y[i, j2] for i in PCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST6")
            ST7 = model.addConstrs((ZC[i, j1, j2] + ZC[i, j2, j1] >= (X[i, j1] + X[i, j2] - 1) for i in CCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST7")
            ST8 = model.addConstrs((ZP[i, j1, j2] + ZP[i, j2, j1] >= (Y[i, j1] + Y[i, j2] - 1) for i in PCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST8")
            ST9 = model.addConstrs(((X.sum('*',j)) + (Y.sum('*',j)) <= 1 for j in jobs), name="ST9")  
            ST10= model.addConstrs((W[j1] + T <= S[j2] + Mlimit * (1 - ZC[i, j1, j2]) for i in CCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST10")
            ST11= model.addConstrs((W[j1] + T <= S[j2] + Mlimit * (1 - ZP[i, j1, j2]) for i in PCcars for j1 in jobs for j2 in jobs if j1 != j2), name="ST11")
    
            # update model
            model.update()
            
            # objective function
            obj = B * (quicksum(M[j] * X[i, j] for i in CCcars for j in jobs)) + (quicksum(M[j] * Y[i, j] for i in PCcars for j in jobs))
            model.setObjective(obj, GRB.MAXIMIZE)
    
            # solve
            model.optimize()
    		
    		# get model result
            CCcars_jobs = dict()
            PCcars_jobs = dict()
            for v in model.getVars():
                if v.X > 0 :
                    var_result = v.Varname
                    if var_result[0] == 'X':
                        #assign for CCcars
                        jobs_idx =  int((var_result.split(','))[-1].strip(']'))
                        CCcars_jobs[jobs_idx] = float(M[jobs_idx])
                    if var_result[0] == 'Y':
                        #assign for PCcars
                        jobs_idx =  int((var_result.split(','))[-1].strip(']'))
                        PCcars_jobs[jobs_idx] = float(M[jobs_idx])
            #print(v.Varname, v.X)
            CCcars_jobs_idx = CCcars_jobs.keys()
            PCcars_jobs_idx = PCcars_jobs.keys()
            TXcars_jobs_idx = set(jobs) - (CCcars_jobs_idx | PCcars_jobs_idx)
            
            # feasible or not
            if model.status == GRB.Status.OPTIMAL:
                # feasible: UPDATE loc_DailyAssign_df: 'Work_date','CCcars_num','CCcars_mileage', 'PCcars_mileage','TXcars_mileage', 'Tol_mileage','CCcars_fuel', 'PCcars_fuel','TXcars_fuel','Tol_fuel'
                loc_DailyAssign_df['Work_date'][index_df] = WorkDay
                loc_DailyAssign_df['CCcars_num'][index_df] = CCcars_now
                loc_DailyAssign_df['Tol_mileage'][index_df] = Total_M
                loc_DailyAssign_df['CCcars_mileage'][index_df] = sum(CCcars_jobs.values())
                loc_DailyAssign_df['PCcars_mileage'][index_df] = sum(PCcars_jobs.values())
                loc_DailyAssign_df['TXcars_mileage'][index_df] = Total_M - loc_DailyAssign_df['CCcars_mileage'][index_df] - loc_DailyAssign_df['PCcars_mileage'][index_df]
                
                loc_DailyAssign_df['CCcars_fuel'][index_df] = loc_DailyAssign_df['CCcars_mileage'][index_df] * CCcars_Fuel
                if PCcars_num != 0:
                    # loc for private cars
                    Avg_PCcarsMileage = loc_DailyAssign_df['PCcars_mileage'][index_df] / PCcars_num
                    accu_PCcarsMileage =  accu_PCcarsMileage + Avg_PCcarsMileage
                    if accu_PCcarsMileage <= basic_Mileage:
                        #below basic mileage
                        loc_DailyAssign_df['PCcars_fuel'][index_df] = (Avg_PCcarsMileage * below_PCcarsFuel) * PCcars_num 
                    else:
                        #over basic mileage
                        accu_PCcarsMileage_last = accu_PCcarsMileage - Avg_PCcarsMileage  #left_fuel for $6
                        if accu_PCcarsMileage_last < basic_Mileage and accu_PCcarsMileage > basic_Mileage:
                            fuel_6 = ((basic_Mileage - accu_PCcarsMileage_last) * below_PCcarsFuel) * PCcars_num
                            fuel_4 = ((accu_PCcarsMileage - basic_Mileage) * upper_PCcarsFuel) * PCcars_num
                            loc_DailyAssign_df['PCcars_fuel'][index_df] = fuel_6 + fuel_4
                        else:
                            loc_DailyAssign_df['PCcars_fuel'][index_df] = (Avg_PCcarsMileage * upper_PCcarsFuel) * PCcars_num
                else:
                    # loc for no private cars
                    loc_DailyAssign_df['PCcars_fuel'][index_df] = 0
                 
                #compute TX_cars fuel
                TXcars_start_KM = TXcars_start_M / 1000
                loc_DailyAssign_df['TXcars_fuel'][index_df] = initial_TXcars * len(TXcars_jobs_idx) + add_TXcars * (loc_DailyAssign_df['TXcars_mileage'][index_df] - TXcars_start_KM * len(TXcars_jobs_idx))
                loc_DailyAssign_df['Tol_fuel'][index_df] = loc_DailyAssign_df['CCcars_fuel'][index_df] + loc_DailyAssign_df['PCcars_fuel'][index_df] + loc_DailyAssign_df['TXcars_fuel'][index_df]
                
                index_df = index_df+1
                #print(obj.getValue())
                #print(Total_M)
            else:
                # infeasible
                print('Wrong day for infeasible')
    
        # roundly df_loc_DailyAssign_detail: yearly loc Daily record for mileage 
        if CCcars_now == runCar_start:
            df_loc_DailyAssign_detail =  loc_DailyAssign_df
        else:
            df_loc_DailyAssign_detail = df_loc_DailyAssign_detail.append(loc_DailyAssign_df)
            
        # UPDATE df_loc_DailyAssign_cost: 'CCcars_num','FixedCost_rent','CCcars_fuel','PCcars_fuel','TXcars_fuel','VarCost_fuel','TotalCost','Taxi_prob'
        df_loc_DailyAssign_detail_CARNOW = df_loc_DailyAssign_detail.loc[df_loc_DailyAssign_detail['CCcars_num'] == CCcars_now]
        df_loc_DailyAssign_cost['FixedCost_rent'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = CCcars_Rent * CCcars_now
        df_loc_DailyAssign_cost['CCcars_fuel'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = df_loc_DailyAssign_detail_CARNOW['CCcars_fuel'].sum()
        df_loc_DailyAssign_cost['PCcars_fuel'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = df_loc_DailyAssign_detail_CARNOW['PCcars_fuel'].sum()
        df_loc_DailyAssign_cost['TXcars_fuel'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = df_loc_DailyAssign_detail_CARNOW['TXcars_fuel'].sum()
        df_loc_DailyAssign_cost['VarCost_fuel'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = df_loc_DailyAssign_detail_CARNOW['Tol_fuel'].sum()
        df_loc_DailyAssign_cost['TotalCost'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = df_loc_DailyAssign_cost['FixedCost_rent'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] + df_loc_DailyAssign_cost['VarCost_fuel'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)]
        #taxi_day = (df_loc_DailyAssign_detail_CARNOW.loc[df_loc_DailyAssign_detail_CARNOW['TXcars_fuel'] != 0]).count()
        #total_day = df_loc_DailyAssign_detail_CARNOW['TXcars_fuel'].count() 
        #df_loc_DailyAssign_cost['Taxi_prob'][(df_loc_DailyAssign_cost.CCcars_num == CCcars_now)] = taxi_day / total_day
    
    return df_loc_DailyAssign_cost.to_excel('../docs/loc_DailyAssign_cost.xlsx', encoding='utf-8', index=False), df_loc_DailyAssign_detail.to_excel('../docs/loc_DailyAssign_detail.xlsx', encoding='utf-8', index=False) 