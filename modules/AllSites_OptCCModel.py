# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_PathDist_module

Input ex:
    Run_TotalSites('D:\\nec-backend\\dist\\docs\\mrData.xlsx',
    'D:\\nec-backend\\dist\\docs\\workerData.xlsx',
    'D:\\nec-backend\\dist\\docs\\officeAddress.xlsx',
    'D:\\nec-backend\\dist\\docs\\taxiCost.xlsx',
    30, 800.0, 6.0, 4.0, 2.42)
"""

# packages import 
import pandas as pd
import numpy as np
import googlemaps
from gurobipy import *
import time

def Run_TotalSites(Service_FN, Worker_FN, Office_FN, TXcost_FN, workTime_buffer, PC_basicMilleage, PC_belowCost, PC_upperCost, CC_avgCost):
    
    '''
    <input>
    Service_FN: string [file path]     # NEC_MRDATA_original
    Worker_FN: string [file path]      # NEC_workerDATA
    Office_FN: string [file path]      # TW_sites_address
    TXcost_FN: string [file path]      # TW_TXcars_cost
    workTime_buffer: int               # works_between_buffer_mins
    PC_basicMilleage: float            # private_car_monthly_basic_Mileage_km
    PC_belowCost: float                # private_car_below_basicM_fuel_cost_$/km
    PC_upperCost: float                # private_car_below_basicM_fuel_cost_$/km
    CC_avgCost: float                  # company_car_fuel_cost_$/km
    
    <output>
    PriceSens_final_df: dataframe (table)
    '''
    tStart = time.time()#計時開始
    ###### MODULE ONE: PathDist.py################################################################
    
    def PathDist(Service_File, Worker_File, Office_File, office_EGnm):
        
        '''
        <input>
        Service_File: string [file path]     # NEC_MRDATA_original
        Worker_File: string [file path]      # NEC_workerDATA
        Office_File: string [file path]      # NEC_TW_sites_address
        office: string
        
        <output>
        (site)_PathDist_detail: dataframe (table), original MRDATA resort with path labeled
        (site)_PathDist_analy: dataframe (table), each uniquePath info with Out_date, Path_ID/order, MoveDist_GO/BACK/TOL, Begin/End_time columns
        '''
    
        # read original MR_DATA files
        Service_Data = pd.read_excel(Service_File)
        Worker_Data = pd.read_excel(Worker_File)
        Office_Data = pd.read_excel(Office_File)
        
        # match serciceDATA and workerDATA
        Worker_Data = Worker_Data.drop(['person_nm', 'actgr_nm'], axis = 1) 
        Data = pd.merge(Service_Data, Worker_Data, on='case_no')
        
        # office select and resort --> PathData
        office = Office_Data.loc[Office_Data.actgr == office_EGnm]['actgr_office'].item()
        office_addr = Office_Data.loc[Office_Data.actgr_office == office]['actgr_address'].item()
        office_nm = Office_Data.loc[Office_Data.actgr_office == office]['actgr_name'].item()
        loc_Data =  Data[Data['actgr_nm'] == office_nm]
        loc_Data['out_day'] = (pd.to_datetime(loc_Data.out_dt)).dt.date
        loc_Data['out_dt_secs'] = pd.to_timedelta(loc_Data['out_dt']).dt.total_seconds()
        loc_Data['back_dt_secs'] = pd.to_timedelta(loc_Data['back_dt']).dt.total_seconds()
        loc_Data_resort = loc_Data.sort_values(['out_day','person_id','out_dt_secs'], ascending=[True,True,True])
        
        # remove null value row by address column
        loc_Data_resort = loc_Data_resort[~loc_Data_resort['comp_address'].isnull()]
        loc_Data_resort = loc_Data_resort[~loc_Data_resort['out_dt'].isnull()]
        
        # read loc_custDist data
        custDist_file = '../docs/loc_CustAddr_Dist/' + office_EGnm + '_df_custAddr_dist.xlsx'
        custDist_Data = pd.read_excel(custDist_file, index_col=0)   
        
        ############################### GoogleMap API, distance/pathID labeled
        Service_count = loc_Data_resort.shape[0]
           
        # google map api 
        def distance_GM(origin_addr, destination_addr):
            gmaps = googlemaps.Client(key='AIzaSyDAaFOcsAx-48cmCeX3r-lKXe7ldIYN75I')
            result = gmaps.distance_matrix(origin_addr, destination_addr, mode = 'driving')['rows'][0]['elements'][0]
            if result['status'] == 'OK':
                Act_Dist = result['distance']['value']
                Dist = round((Act_Dist/1000), 0)
            else:
                Dist = -1
            return Dist    
        
        # prepare df_final_Data
        final_Data = np.zeros((1, 16))
        df_final_Data = pd.DataFrame(final_Data, columns = ['case_no', 'case_dt' , 'companY_id', 'companY_nm' , 'comp_address' , 'actgr_nm' , 'callt_id' , 'out_dt' , 'arrival_dt' ,'end_Dt' , 'back_dt', 'next_place', 'person_id', 'out_day', 'out_dt_secs', 'back_dt_secs'])    
        
        # main: getting distance(go/back), path_label
        pro_caseNo = list()
        Go_Dist = list()
        Back_Dist = list()    
        Daily_PathID = list()
        Daily_PathOrder = list()
        Daily_UniquePathID = list()
        
        for idx in range(0, Service_count):
            if idx == 0:
                # first service in one year
                origins_Goaddr = office_addr
                destination_GOaddr = loc_Data_resort.iloc[idx]['comp_address']
                
                # get/update custDist_Data
                if destination_GOaddr not in list(custDist_Data.columns):
                    # need add col&idx in custDist_Data
                    custDist_Data[destination_GOaddr] = 0
                    new_temp = np.zeros((1, len(list(custDist_Data.columns))))
                    new_row = pd.DataFrame(new_temp, index = [destination_GOaddr], columns = list(custDist_Data.columns))
                    custDist_Data = custDist_Data.append(new_row)
                    
                # check&get GO_result
                if custDist_Data.at[origins_Goaddr,destination_GOaddr] == 0:
                    GO_result = distance_GM(origins_Goaddr, destination_GOaddr)
                    if GO_result != -1:
                        custDist_Data.at[origins_Goaddr,destination_GOaddr] = GO_result
                        custDist_Data.at[destination_GOaddr,origins_Goaddr] = GO_result
                else:
                    GO_result = custDist_Data.at[origins_Goaddr,destination_GOaddr]
        
                # check GO_result
                if GO_result == -1:
                    # addr_wrong
                    pro_caseNo.append(loc_Data_resort.iloc[idx]['case_no'])
                    last_Goaddr = origins_Goaddr
                else:
                    # addr_right: final_df, Go_Dist, dpath_ID, dpath_Order
                    df_final_Data = df_final_Data.append(loc_Data_resort.iloc[idx,:])
                    df_final_Data = df_final_Data.drop(df_final_Data.index[0])
                    
                    Go_Dist.append(GO_result)
                    last_Goaddr = destination_GOaddr
                    
                    dpath_ID = 1
                    dpath_Order = 1 
                    Daily_PathID.append(dpath_ID)
                    Daily_PathOrder.append(dpath_Order)
                    
                    # record last right info
                    finaldf_idx = 0
                    last_Outday = df_final_Data.iloc[finaldf_idx]['out_day']
                    last_Worker = df_final_Data.iloc[finaldf_idx]['person_id']
                    last_NextPlace = df_final_Data.iloc[finaldf_idx]['next_place']
                    
                    # unique_path_ID
                    theday = df_final_Data.iloc[finaldf_idx]['out_day']
                    date = theday.strftime('%Y%m%d')
                    UniqueID =  '_' .join([date, str(dpath_ID)])
                    Daily_UniquePathID.append(UniqueID)
                    
            else:
                # non-first service in one year
                if last_Outday != loc_Data_resort.iloc[idx]['out_day']:
                    # daily first path first service
                    origins_Goaddr = office_addr
                    destination_GOaddr = loc_Data_resort.iloc[idx]['comp_address']
                    
                    # get/update custDist_Data
                    if destination_GOaddr not in list(custDist_Data.columns):
                        # need add col&idx in custDist_Data
                        custDist_Data[destination_GOaddr] = 0
                        new_temp = np.zeros((1, len(list(custDist_Data.columns))))
                        new_row = pd.DataFrame(new_temp, index = [destination_GOaddr], columns = list(custDist_Data.columns))
                        custDist_Data = custDist_Data.append(new_row)
                        
                    # check&get GO_result
                    if custDist_Data.at[origins_Goaddr,destination_GOaddr] == 0:
                        GO_result = distance_GM(origins_Goaddr, destination_GOaddr)
                        if GO_result != -1:
                            custDist_Data.at[origins_Goaddr,destination_GOaddr] = GO_result
                            custDist_Data.at[destination_GOaddr,origins_Goaddr] = GO_result
                    else:
                        GO_result = custDist_Data.at[origins_Goaddr,destination_GOaddr]
                        
                    # check GO_result
                    if GO_result == -1:
                        # addr_wrong
                        pro_caseNo.append(loc_Data_resort.iloc[idx]['case_no'])
                        last_Goaddr = origins_Goaddr
                    else:
                        # addr_right: last_Back_Dist, final_df, Go_Dist, dpath_ID, dpath_Order
                        origins_Backaddr =  df_final_Data.iloc[finaldf_idx]['comp_address']
                        destination_Backaddr = office_addr   # office addr
                        
                        # check&get BACK_result
                        if custDist_Data.at[origins_Backaddr,destination_Backaddr] == 0:
                            BACK_result = distance_GM(origins_Backaddr, destination_Backaddr)
                            if BACK_result != -1:
                                custDist_Data.at[origins_Backaddr,destination_Backaddr] = BACK_result
                                custDist_Data.at[destination_Backaddr,origins_Backaddr] = BACK_result
                        else:
                            BACK_result = custDist_Data.at[origins_Backaddr,destination_Backaddr]
                        Back_Dist.append(BACK_result)
                        
                        df_final_Data = df_final_Data.append(loc_Data_resort.iloc[idx])
                        finaldf_idx = finaldf_idx + 1
                        
                        Go_Dist.append(GO_result)
                        last_Goaddr = destination_GOaddr
                        
                        dpath_ID = 1
                        dpath_Order = 1 
                        Daily_PathID.append(dpath_ID)
                        Daily_PathOrder.append(dpath_Order)
                        
                        # update last right info
                        last_Outday = df_final_Data.iloc[finaldf_idx]['out_day']
                        last_Worker = df_final_Data.iloc[finaldf_idx]['person_id']
                        last_NextPlace = df_final_Data.iloc[finaldf_idx]['next_place']
                        
                        # unique_path_ID
                        theday = df_final_Data.iloc[finaldf_idx]['out_day']
                        date = theday.strftime('%Y%m%d')
                        UniqueID =  '_' .join([date, str(dpath_ID)])
                        Daily_UniquePathID.append(UniqueID)
                                           
                else:
                    if (last_NextPlace == '返社') or (last_Worker != loc_Data_resort.iloc[idx]['person_id']):
                        # daily each path first service
                        origins_Goaddr = office_addr
                        destination_GOaddr = loc_Data_resort.iloc[idx]['comp_address']
                        
                        # get/update custDist_Data
                        if destination_GOaddr not in list(custDist_Data.columns):
                            # need add col&idx in custDist_Data
                            custDist_Data[destination_GOaddr] = 0
                            new_temp = np.zeros((1, len(list(custDist_Data.columns))))
                            new_row = pd.DataFrame(new_temp, index = [destination_GOaddr], columns = list(custDist_Data.columns))
                            custDist_Data = custDist_Data.append(new_row)
                            
                        # check&get GO_result
                        if custDist_Data.at[origins_Goaddr,destination_GOaddr] == 0:
                            GO_result = distance_GM(origins_Goaddr, destination_GOaddr)
                            if GO_result != -1:
                                custDist_Data.at[origins_Goaddr,destination_GOaddr] = GO_result
                                custDist_Data.at[destination_GOaddr,origins_Goaddr] = GO_result
                        else:
                            GO_result = custDist_Data.at[origins_Goaddr,destination_GOaddr]
                            
                        # check GO_result
                        if GO_result == -1:
                            # addr_wrong
                            pro_caseNo.append(loc_Data_resort.iloc[idx]['case_no'])
                            last_Goaddr = origins_Goaddr
                        else:
                            # addr_right: last_Back_Dist, final_df, Go_Dist, dpath_ID, dpath_Order
                            origins_Backaddr =  df_final_Data.iloc[finaldf_idx]['comp_address']
                            destination_Backaddr = office_addr   # office addr
                            
                            # check&get BACK_result
                            if custDist_Data.at[origins_Backaddr,destination_Backaddr] == 0:
                                BACK_result = distance_GM(origins_Backaddr, destination_Backaddr)
                                if BACK_result != -1:
                                    custDist_Data.at[origins_Backaddr,destination_Backaddr] = BACK_result
                                    custDist_Data.at[destination_Backaddr,origins_Backaddr] = BACK_result
                            else:
                                BACK_result = custDist_Data.at[origins_Backaddr,destination_Backaddr]
                            Back_Dist.append(BACK_result)
                            
                            df_final_Data = df_final_Data.append(loc_Data_resort.iloc[idx])
                            finaldf_idx = finaldf_idx + 1
                            
                            Go_Dist.append(GO_result)
                            last_Goaddr = destination_GOaddr
                            
                            dpath_ID = dpath_ID + 1
                            dpath_Order = 1
                            Daily_PathID.append(dpath_ID)
                            Daily_PathOrder.append(dpath_Order)
                            
                            # update last right info
                            last_Outday = df_final_Data.iloc[finaldf_idx]['out_day']
                            last_Worker = df_final_Data.iloc[finaldf_idx]['person_id']
                            last_NextPlace = df_final_Data.iloc[finaldf_idx]['next_place']
                            
                            # unique_path_ID
                            theday = df_final_Data.iloc[finaldf_idx]['out_day']
                            date = theday.strftime('%Y%m%d')
                            UniqueID =  '_' .join([date, str(dpath_ID)])
                            Daily_UniquePathID.append(UniqueID)
                    else:
                        # daily each path non-first service
                        origins_Goaddr = last_Goaddr
                        destination_GOaddr = loc_Data_resort.iloc[idx]['comp_address']
                        
                        # get/update custDist_Data
                        if destination_GOaddr not in list(custDist_Data.columns):
                            # need add col&idx in custDist_Data
                            custDist_Data[destination_GOaddr] = 0
                            new_temp = np.zeros((1, len(list(custDist_Data.columns))))
                            new_row = pd.DataFrame(new_temp, index = [destination_GOaddr], columns = list(custDist_Data.columns))
                            custDist_Data = custDist_Data.append(new_row)
                            
                        # check&get GO_result
                        if custDist_Data.at[origins_Goaddr,destination_GOaddr] == 0:
                            GO_result = distance_GM(origins_Goaddr, destination_GOaddr)
                            if GO_result != -1:
                                custDist_Data.at[origins_Goaddr,destination_GOaddr] = GO_result
                                custDist_Data.at[destination_GOaddr,origins_Goaddr] = GO_result
                        else:
                            GO_result = custDist_Data.at[origins_Goaddr,destination_GOaddr]
                            
                        # check GO_result
                        if GO_result == -1:
                            # addr_wrong
                            pro_caseNo.append(loc_Data_resort.iloc[idx]['case_no'])
                            last_Goaddr = origins_Goaddr
                        else:
                            # addr_right: last_Back_Dist, final_df, Go_Dist, dpath_ID, dpath_Order
                            BACK_result = 0
                            Back_Dist.append(BACK_result)
                            
                            df_final_Data = df_final_Data.append(loc_Data_resort.iloc[idx])
                            finaldf_idx = finaldf_idx + 1
                            
                            Go_Dist.append(GO_result)
                            last_Goaddr = destination_GOaddr
                            
                            dpath_ID = dpath_ID
                            dpath_Order = dpath_Order + 1
                            Daily_PathID.append(dpath_ID)
                            Daily_PathOrder.append(dpath_Order)
                            
                            # update last right info
                            last_Outday = df_final_Data.iloc[finaldf_idx]['out_day']
                            last_Worker = df_final_Data.iloc[finaldf_idx]['person_id']
                            last_NextPlace = df_final_Data.iloc[finaldf_idx]['next_place']
            
                            # unique_path_ID
                            theday = df_final_Data.iloc[finaldf_idx]['out_day']
                            date = theday.strftime('%Y%m%d')
                            UniqueID =  '_' .join([date, str(dpath_ID)])
                            Daily_UniquePathID.append(UniqueID)             
        
        # Last right service  back_Dist        
        origins_Backaddr =  df_final_Data.iloc[finaldf_idx]['comp_address']
        destination_Backaddr = office_addr   # office addr
        
        # check&get BACK_result
        if custDist_Data.at[origins_Backaddr,destination_Backaddr] == 0:
            BACK_result = distance_GM(origins_Backaddr, destination_Backaddr)
            if BACK_result != -1:
                custDist_Data.at[origins_Backaddr,destination_Backaddr] = BACK_result
                custDist_Data.at[destination_Backaddr,origins_Backaddr] = BACK_result
        else:
            BACK_result = custDist_Data.at[origins_Backaddr,destination_Backaddr]
        Back_Dist.append(BACK_result)
        
        # combine: Go_Dist, Back_Dist, Daily_PathID, Daily_PathOrder
        df_final_Data['GoMove_Dist'] = Go_Dist
        df_final_Data['BackMove_Dist'] = Back_Dist
        df_final_Data['Daily_PathID'] = Daily_PathID 
        df_final_Data['Daily_PathOrder'] = Daily_PathOrder
        df_final_Data['Unique_PathID'] = Daily_UniquePathID    
                
        ############################### Path_analysis
        loc_PathID = list(set(df_final_Data['Unique_PathID']))
        loc_PathCount = len(loc_PathID)
        loc_PathData = np.zeros((loc_PathCount, 10))
        loc_PathData_df = pd.DataFrame(loc_PathData, columns = ['Out_Day', 'Path_Order' , 'Unique_PathID', 'PathGo_MoveDist' , 'PathBack_MoveDist' , 'PathTol_MoveDist(km)' , 'Begin_Time(normal)' , 'End_Time(normal)' , 'Begin_Time(secs)' , 'End_Time(secs)'])
        loc_PathData_df['Unique_PathID'] = loc_PathID
        temp =loc_PathData_df['Unique_PathID'].str.split("_", n = 1, expand = True) 
        loc_PathData_df['Out_Day'] = temp[0]
        loc_PathData_df['Path_Order'] = temp[1].astype(int)
        
        for i in range(0, loc_PathCount):
            goal_PathID = loc_PathID[i]
            EP_DailyData = df_final_Data[df_final_Data['Unique_PathID'] == goal_PathID]
            EP_count = EP_DailyData.shape[0]
            
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'PathGo_MoveDist'] =  EP_DailyData['GoMove_Dist'].sum()
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'PathBack_MoveDist'] =  EP_DailyData['BackMove_Dist'].sum()
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'PathTol_MoveDist(km)'] =  (EP_DailyData['GoMove_Dist'].sum()) + (EP_DailyData['BackMove_Dist'].sum())
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'Begin_Time(normal)'] =  EP_DailyData.iloc[0]['out_dt']
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'End_Time(normal)'] =  EP_DailyData.iloc[(EP_count-1)]['back_dt']
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'Begin_Time(secs)'] =  EP_DailyData.iloc[0]['out_dt_secs']
            loc_PathData_df.loc[loc_PathData_df.Unique_PathID == goal_PathID, 'End_Time(secs)'] =  EP_DailyData.iloc[(EP_count-1)]['back_dt_secs']     
        
        ############################### Export df_result
        # change columns name
        df_final_Data = df_final_Data.rename({'case_no': '服務編號', 'case_dt': '服務日期時間', 'companY_id': '顧客編號', 'companY_nm': '顧客名稱', 'comp_address': '顧客地址', 'actgr_nm': '服務據點', 'callt_id': '服務類型', 'out_dt': '出發時間', 'arrival_dt': '抵達時間', 'end_Dt': '結束時間', 'back_dt': '返回時間', 'next_place': '下一站', 'person_id': '負責人員', 'out_day': '服務日期', 'out_dt_secs': '出發時間(秒)', 'back_dt_secs': '返回時間(秒)', 'Daily_PathID': '當日路徑編號', 'Daily_PathOrder': '路徑上服務順序', 'Unique_PathID': '路徑編號', 'GoMove_Dist': '去程移動距離(公里)', 'BackMove_Dist': '回程移動距離(公里)'}, axis=1)  # new method
        loc_PathData_df = loc_PathData_df.rename({'Out_Day': '服務日期', 'Path_Order': '當日服務路徑順序', 'Unique_PathID': '路徑編號', 'PathGo_MoveDist': '去程移動總距離(公里)', 'PathBack_MoveDist': '回程移動總距離(公里)', 'PathTol_MoveDist(km)': '路徑移動總距離(公里)', 'Begin_Time(normal)': '服務開始時間', 'End_Time(normal)': '服務結束時間', 'Begin_Time(secs)': '服務開始時間(秒)', 'End_Time(secs)': '服務結束時間(秒)'}, axis=1)  
        loc_PathData_df = loc_PathData_df.sort_values(['服務日期','當日服務路徑順序'], ascending=[True,True])    
        
        # export excel files
        custDist_Data.to_excel(custDist_file , encoding='utf-8', index=True)
        df_final_Data.to_excel('../docs/'+ office_EGnm +'_PathDist_detail.xlsx', encoding='utf-8', index=False)
        loc_PathData_df.to_excel('../docs/'+ office_EGnm +'_PathDist_analy.xlsx', encoding='utf-8', index=False)
        
        return loc_PathData_df   
        
    ###### MODULE TWO: OptModule.py###############################################################
        
    def OptModel(works_buffer, CCcars_Fuel, basic_Mileage, below_PCcarsFuel, upper_PCcarsFuel, office_EGnm, TXcost_File, Office_File, loc_PathFile):
    
        '''
        <input>
        works_buffer: int                 # works_between_buffer_mins
        CCcars_Fuel: float                # company_car_fuel_cost_$/km
        basic_Mileage: float              # private_car_monthly_basic_Mileage_km
        below_PCcarsFuel: float           # private_car_below_basicM_fuel_cost_$/km
        upper_PCcarsFuel: flost           # private_car_upper_basicM_fuel_cost_$/km
        office: string                    
        TXcost_File: string [file path]   ### TW_TXcars_cost
        Office_File: string [file path]   ### NEC_TW_sites_address
        loc_PathFile: string              ### (site)_PathDist_analy
        
        <output>
        (site)_DailyAssign_detail: dataframe (table), each CCcar_num whole year DailyAssign cost (each day result)
        (site)_DailyAssign_cost: dataframe (table), each CCcar_num whole year DailyAssign cost (whole year result)
        
        '''
    
        # variables & files reading
        TXcost_Data = pd.read_excel(TXcost_File)
            
        office = TXcost_Data.loc[TXcost_Data.actgr == office_EGnm]['actgr_office'].item()
        TXcars_start_M = TXcost_Data.loc[TXcost_Data.actgr_office == office]['initial_TXmileage(m)'].item()	# taxi_car_basic_Mileage_m
        initial_TXcars = TXcost_Data.loc[TXcost_Data.actgr_office == office]['initial_Txcost($)'].item()	# taxi_car_basic_cost_$
        add_TXcars = TXcost_Data.loc[TXcost_Data.actgr_office == office]['add_Txcost($/km)'].item()			# taxi_car_addtional_cost_$/km
            
        Office_Data = pd.read_excel(Office_File)
        CCcars_num = Office_Data.loc[Office_Data.actgr_office == office]['actgr_CCcarsNum'].item()          # loc_company_car_supply_num
        PCcars_num = Office_Data.loc[Office_Data.actgr_office == office]['actgr_PCcarsNum'].item()          # loc_private_car_supply_num
        CCcars_Rent = Office_Data.loc[Office_Data.actgr_office == office]['actgr_CCcarsRent'].item()        # loc_company_car_rental_$
            
        loc_PathData = loc_PathFile
        
        ############################## Create loc param table
        servDay = list(set(loc_PathData['服務日期']))
        servDay.sort()
        numDay = len(servDay)
            
        loc_param_data = np.zeros(( 9, numDay))
        loc_param = pd.DataFrame(loc_param_data, columns = servDay, index = ['param_m','param_p','param_n','param_W','param_S','param_M','param_T','param_B','param_Mlimit'])
            
        for day in servDay:
            #day = servDay[2]
            loc_DayPath = loc_PathData.loc[loc_PathData['服務日期'] == day]
            min_beginTime = loc_DayPath['服務開始時間(秒)'].min()
            min_endTime = loc_DayPath['服務結束時間(秒)'].min()
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
                path_endTime = loc_DayPath.loc[path_index, '服務結束時間(秒)'] - min_endTime
                path_beginTime = loc_DayPath.loc[path_index, '服務開始時間(秒)'] - min_beginTime
                path_moveTime = loc_DayPath.loc[path_index, '路徑移動總距離(公里)']
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
            	
        ############################### Create Optimal Model
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
                if (WorkDay[-1] == "1" and WorkDay[-2] == "0") or (d == servDay[0]):
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
                    W[n_index] = int(float(ls_W[j]))
                    S[n_index] = int(float(ls_S[j]))
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
        
        ############################### Export df_result       
        # conclusion
        min_CCcarnum = df_loc_DailyAssign_cost.loc[df_loc_DailyAssign_cost['TotalCost'].idxmin()]['CCcars_num']
        min_CCcarCost = df_loc_DailyAssign_cost.loc[df_loc_DailyAssign_cost['TotalCost'].idxmin()]['TotalCost']
        final_result = ' 本年度 「' + office + '據點」 車輛最佳配置結果：\n 在私車基本里程數門檻為 ' + str(basic_Mileage) + ' 公里，基本里程數內/外單位(每公里)補助額度各為($' + str(below_PCcarsFuel) + ', $' + str(upper_PCcarsFuel) + ')的情況下，\n 若該據點的「私車目前供應」為 ' + str(PCcars_num) + ' 輛，\n 則「社車最佳供應」為 '+ str(int(min_CCcarnum)) + ' 輛，年度總成本為 $' + str(format(int(min_CCcarCost), ',')) + '。'
        #final_result_utf8 = final_result.encode('UTF-8')
        with open('../docs/'+ office_EGnm + '_CarOpt_Conclusion.txt', "w") as text_file:
            #text_file.write(final_result_utf8.decode('UTF-8','strict'))
            text_file.write(final_result)        
            
        # format cells values
        float_col_1 = df_loc_DailyAssign_cost.select_dtypes(include = ['float64'])
        for col_1 in float_col_1.columns.values:
            df_loc_DailyAssign_cost[col_1] = df_loc_DailyAssign_cost[col_1].astype('int64')
            for idx_1 in df_loc_DailyAssign_cost.index:
                df_loc_DailyAssign_cost[col_1].iloc[idx_1] = format(df_loc_DailyAssign_cost[col_1].iloc[idx_1], ',')
                
        # change columns name
        df_loc_DailyAssign_detail = df_loc_DailyAssign_detail.rename({'Work_date': '服務日期', 'CCcars_num': '據點社車數量(輛)', 'CCcars_mileage': '據點社車累計行駛量(公里)', 'PCcars_mileage': '據點私車累計行駛量(公里)', 'TXcars_mileage': '據點計程車累計行駛量(公里)', 'Tol_mileage': '當日累計總行駛量(公里)', 'CCcars_fuel': '社車當日油耗成本(元)', 'PCcars_fuel': '私車當日油耗成本(元)', 'TXcars_fuel': '計程車當日使用成本(元)', 'Tol_fuel': '交通成本總計(元)'}, axis=1)
        df_loc_DailyAssign_cost = df_loc_DailyAssign_cost.rename({'CCcars_num': '據點社車數量(輛)', 'FixedCost_rent': '固定成本_年度社車租賃費用(輛/元)', 'CCcars_fuel': '變動成本_年度社車油耗成本(元)', 'PCcars_fuel': '變動成本_年度私車油耗成本(元)', 'TXcars_fuel': '變動成本_年度計程車使用成本(元)', 'VarCost_fuel': '變動成本總計(元)', 'TotalCost': '總成本(元)'}, axis=1)    
        
        df_loc_DailyAssign_detail.to_excel('../docs/'+ office_EGnm +'_DailyAssign_detail.xlsx', encoding='utf-8', index=False)
        df_loc_DailyAssign_cost.to_excel('../docs/'+ office_EGnm +'_DailyAssign_cost.xlsx', encoding='utf-8', index=False)   
        
        return df_loc_DailyAssign_cost, df_loc_DailyAssign_detail
    
    
    ###### MODULE THREE: PPcarsPS.py##############################################################
    
    def PPcarsPS(basic_Mileage, office_EGnm, Office_File, loc_DailyAssign_file):
        
        '''
        <input>
        basic_Mileage: float                         # private_car_monthly_basic_Mileage_km
        office: string
        Office_File: string [file path]              ### NEC_TWoffice_address
        loc_DailyAssign_file: string [file path]     ### loc_DailyAssign_detail
        
        <output>
        df_loc_PScost: dataframe (table), loc_PPcars_PriceSensitivity_cost 
        '''
    
        # loc PCcars_OptNumber_sensitivity
        #loc_CarNsens_data = np.zeros((7, 9))
        #loc_CarNsens_df = pd.DataFrame(loc_CarNsens_data, columns = ['AddPrice$2' , 'AddPrice$3', 'AddPrice$4' , 'AddPrice$5' , 'AddPrice$6', 'AddPrice$7', 'AddPrice$8', 'AddPrice$9', 'AddPrice$10'], index=['BasePrice$4', 'BasePrice$5', 'BasePrice$6' , 'BasePrice$7' , 'BasePrice$8', 'BasePrice$9', 'BasePrice$10'])
        # loc PCcars_OptCost_sensitivity
        loc_Costsens_data = np.zeros((7, 9))
        loc_Costsens_df = pd.DataFrame(loc_Costsens_data, columns = ['里程數外_單位補助$2' , '里程數外_單位補助$3', '里程數外_單位補助$4' , '里程數外_單位補助$5' , '里程數外_單位補助$6', '里程數外_單位補助$7', '里程數外_單位補助$8', '里程數外_單位補助$9', '里程數外_單位補助$10'], index=['里程數內_單位補助$4', '里程數內_單位補助$5', '里程數內_單位補助$6' , '里程數內_單位補助$7' , '里程數內_單位補助$8', '里程數內_單位補助$9', '里程數內_單位補助$10'])
        
        loc_DailyAssign_df = loc_DailyAssign_file
        loc_DailyAssign_df['服務日期'] = loc_DailyAssign_df['服務日期'].astype('int64')
        Office_Data = pd.read_excel(Office_File)
        office = Office_Data.loc[Office_Data.actgr == office_EGnm]['actgr_office'].item()
        CCcars_num = Office_Data.loc[Office_Data.actgr_office == office]['actgr_CCcarsNum'].item()          # loc_company_car_supply_num
        PCcars_num = Office_Data.loc[Office_Data.actgr_office == office]['actgr_PCcarsNum'].item()          # loc_private_car_supply_num
        CCcars_Rent = Office_Data.loc[Office_Data.actgr_office == office]['actgr_CCcarsRent'].item()        # loc_company_car_rental_$
    
        ########## PCcars_sensitivity
        runCar_start = 0
        runCar_end = CCcars_num*2+1
            
        for base_price in range(4,11):
            for add_price in range(2,11):
                if base_price > add_price:
                    # loc yearly Total_cost_analysis data
                    loc_CostAnaly_data = np.zeros((runCar_end, 7))
                    loc_CostAnaly_df = pd.DataFrame(loc_CostAnaly_data ,columns=['CCcars_num','FixedCost_rent','CCcars_fuel','PCcars_fuel','TXcars_fuel','VarCost_fuel','TotalCost'])
                    loc_CostAnaly_df['CCcars_num'] = range(runCar_start, runCar_end)
                
                    #for cars run
                    for CCcars_now in range(runCar_start, runCar_end):
                        # daily assignment info
                        loc_DailyAssign_carNow =  loc_DailyAssign_df.loc[(loc_DailyAssign_df['據點社車數量(輛)'] == CCcars_now),['服務日期','據點社車數量(輛)','據點社車累計行駛量(公里)','據點私車累計行駛量(公里)','據點計程車累計行駛量(公里)','社車當日油耗成本(元)','計程車當日使用成本(元)']]
                            
                        # variables setting
                        below_PCcarsFuel = base_price
                        upper_PCcarsFuel = add_price
            				
                        # CCcars & TXcars fuel cost
                        CCcars_total_Fuel = loc_DailyAssign_carNow['社車當日油耗成本(元)'].sum()
                        TXcars_total_Fuel = loc_DailyAssign_carNow['計程車當日使用成本(元)'].sum()
                            
                        # compute PCcars fuel
                        PCcars_total_Fuel = 0.0
                            
                        # daily run for one year
                        servDay_carNow = list(loc_DailyAssign_carNow['服務日期'])
                        for d in servDay_carNow: 
                            # reassign accu_Prvfuel every month
                            WorkDay = str(d)
                            if (WorkDay[-1] == "1" and WorkDay[-2] == "0") or (d == servDay_carNow[0]):
                                accu_PCcarsMileage = 0.0
                                    
                            if PCcars_num != 0:
                                # loc for private cars
                                PCcars_mileage_workday = loc_DailyAssign_carNow['據點私車累計行駛量(公里)'][(loc_DailyAssign_carNow.服務日期 == d)].item()
                                Avg_PCcarsMileage = PCcars_mileage_workday / PCcars_num
                                accu_PCcarsMileage =  accu_PCcarsMileage + Avg_PCcarsMileage
                                if accu_PCcarsMileage <= basic_Mileage:
                                    #below basic mileage
                                    PCcars_daily_Fuel = (Avg_PCcarsMileage * below_PCcarsFuel) * PCcars_num 
                                else:
                                    #over basic mileage
                                    accu_PCcarsMileage_last = accu_PCcarsMileage - Avg_PCcarsMileage  #left_fuel for $6
                                    if accu_PCcarsMileage_last < basic_Mileage and accu_PCcarsMileage > basic_Mileage:
                                        fuel_6 = ((basic_Mileage - accu_PCcarsMileage_last) * below_PCcarsFuel) * PCcars_num
                                        fuel_4 = ((accu_PCcarsMileage - basic_Mileage) * upper_PCcarsFuel) * PCcars_num
                                        PCcars_daily_Fuel = fuel_6 + fuel_4
                                    else:
                                        PCcars_daily_Fuel = (Avg_PCcarsMileage * upper_PCcarsFuel) * PCcars_num
                            else:
                                # loc for no private cars
                                PCcars_daily_Fuel = 0.0
                            
                            PCcars_total_Fuel = PCcars_total_Fuel + PCcars_daily_Fuel
                                
                                    
                        loc_CostAnaly_df['FixedCost_rent'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_Rent * CCcars_now
                        loc_CostAnaly_df['CCcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_total_Fuel
                        loc_CostAnaly_df['PCcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = PCcars_total_Fuel
                        loc_CostAnaly_df['TXcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = TXcars_total_Fuel
                        loc_CostAnaly_df['VarCost_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_total_Fuel + PCcars_total_Fuel + TXcars_total_Fuel
                        loc_CostAnaly_df['TotalCost'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = loc_CostAnaly_df['FixedCost_rent'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] + loc_CostAnaly_df['VarCost_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)]
                        
                        #loc_CostAnaly_df.to_csv('C:\\Users\\User\Desktop\\NEC_CarModel\\190722_ExtOutput_PS_BXAX_Costdetail\\HC_CostInfo_B'+str(base_price)+'_A'+str(add_price)+'.csv')
                
                    # record best cars_num and cost
                    #min_CCcarnum = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]['CCcars_num']
                    min_CCcarCost = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]['TotalCost']
                    below = "里程數內_單位補助$"+str(int(base_price))
                    upper = "里程數外_單位補助$"+str(int(add_price))
                    #loc_CarNsens_df.loc[ [below] ,[upper] ] = int(min_CCcarnum)
                    loc_Costsens_df.loc[ [below] ,[upper] ] = int(min_CCcarCost)
                    
        # format cells values
        loc_Costsens_df_format = loc_Costsens_df.copy()
        for col_1 in loc_Costsens_df_format.columns:
            for idx_1 in loc_Costsens_df_format.index:
                loc_Costsens_df_format.loc[idx_1, col_1] = '$ '+ format(int(loc_Costsens_df_format.loc[idx_1, col_1]), ',')
                    
        loc_Costsens_df_format.to_excel('../docs/'+ office_EGnm +'_PriceSens_cost.xlsx', encoding='utf-8', index=True)
                    
        return loc_Costsens_df
    ###### MAIN  #########################################################################################

    Office_Data = pd.read_excel(Office_FN)
    sites = list(Office_Data['actgr'])
    
    PriceSens_cost = dict()
    
    for sites_idx in range(0, len(sites)):   
        theSite = sites[sites_idx]
        print(theSite)
        df_PathDist_analy = PathDist(Service_FN, Worker_FN, Office_FN, theSite)
        df_DailyAssign_cost, df_DailyAssign_detail = OptModel(workTime_buffer, CC_avgCost, PC_basicMilleage, PC_belowCost, PC_upperCost, theSite, TXcost_FN, Office_FN, df_PathDist_analy)
        df_PScost = PPcarsPS( PC_basicMilleage, theSite, Office_FN, df_DailyAssign_detail)
        PriceSens_cost[sites[sites_idx]] = df_PScost
    
        if sites_idx == 0:
            PriceSens_final_df = PriceSens_cost[sites[sites_idx]]
        else:
            PriceSens_final_df = PriceSens_final_df.add(PriceSens_cost[sites[sites_idx]])
            
    # format cells values
    PriceSens_final_df_format = PriceSens_final_df.copy()
    for col_1 in PriceSens_final_df_format.columns:
        for idx_1 in PriceSens_final_df_format.index:
            PriceSens_final_df_format.loc[idx_1, col_1] = '$ '+ format(int(PriceSens_final_df_format.loc[idx_1, col_1]), ',')
    
    
    tEnd = time.time()#計時結束
    print ("It cost %f sec" % (tEnd - tStart))#會自動做近位
    
    return PriceSens_final_df_format.to_excel('../docs/PriceSens_final.xlsx', encoding='utf-8', index=True)
    