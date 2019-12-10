# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_PathDist_module

Input ex:
    PathDist('C:\\Users\\User\\Desktop\\20191128_NEC_system\\Input_DATA\\2018_MRDATA_original.xlsx',
    'C:\\Users\\User\\Desktop\\20191128_NEC_system\\Input_DATA\\2018_workerDATA.xlsx',
    'C:\\Users\\User\\Desktop\\20191128_NEC_system\\Input_DATA\\TW_sites_address.xlsx',
    '淡水')
"""

# packages import 
import pandas as pd
import numpy as np
import googlemaps
import time

def PathDist(Service_File, Worker_File, Office_File, office):
    
    '''
    <input>
    Service_File: string [file path]     # NEC_MRDATA_original
    Worker_File: string [file path]      # NEC_workerDATA
    Office_File: string [file path]      # NEC_TWoffice_address
    office: string
    
    <output>
    df_loc_PathDist_detail: dataframe (table), original MRDATA resort with path labeled
    df_loc_PathDist_analy: dataframe (table), each uniquePath info with Out_date, Path_ID/order, MoveDist_GO/BACK/TOL, Begin/End_time columns
    '''

    tStart = time.time()#計時開始
    # read original MR_DATA files
    Service_Data = pd.read_excel(Service_File)
    Worker_Data = pd.read_excel(Worker_File)
    Office_Data = pd.read_excel(Office_File)
    
    # match serciceDATA and workerDATA
    Worker_Data = Worker_Data.drop(['person_nm', 'actgr_nm'], axis = 1) 
    Data = pd.merge(Service_Data, Worker_Data, on='case_no')
    
    # office select and resort --> PathData
    office_EGnm = Office_Data.loc[Office_Data.actgr_office == office]['actgr'].item()
    office_addr = Office_Data.loc[Office_Data.actgr_office == office]['actgr_address'].item()
    office_nm = Office_Data.loc[Office_Data.actgr_office == office]['actgr_name'].item()
    loc_Data =  Data[Data['actgr_nm'] == office_nm]
    loc_Data['out_day'] = (pd.to_datetime(loc_Data.out_dt)).dt.date
    loc_Data['out_dt_secs'] = pd.to_timedelta(loc_Data['out_dt']).dt.total_seconds()
    loc_Data['back_dt_secs'] = pd.to_timedelta(loc_Data['back_dt']).dt.total_seconds()
    loc_Data_resort = loc_Data.sort_values(['out_day','person_id','out_dt_secs'], ascending=[True,True,True])
    
    # remove null value row: address, case_no, outday
    loc_Data_resort = loc_Data_resort[~loc_Data_resort['comp_address'].isnull()]
    loc_Data_resort = loc_Data_resort[~loc_Data_resort['out_dt'].isnull()]
    
    # read loc_custDist data
    custDist_file = 'C:\\Users\\User\\Desktop\\20191128_NEC_system\\loc_CustAddr_Dist\\' + office_EGnm + '_df_custAddr_dist.xlsx'
    custDist_Data = pd.read_excel(custDist_file)
    
    #loc_Data_resort.to_excel('C:\\Users\\User\\Desktop\\20191128_NEC_system\\Output_DATA_0_mins\\TS_PathDist_detail_try.xlsx', encoding='utf-8', index=False)
    
    
    #################################################################################################
    Service_count = loc_Data_resort.shape[0]
    
    
    # google map api 
    def distance_GM(origin_addr, destination_addr):
        gmaps = googlemaps.Client(key='AIzaSyBbEPM3JxBb4eQuE_U05edVs5-dUQEPBYE')
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
        print(idx)
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
    
            
    ###############################################################################
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
     
    
    ############################################################################################################################## 
    # change columns name
    df_final_Data = df_final_Data.rename({'case_no': '服務編號', 'case_dt': '服務日期時間', 'companY_id': '顧客編號', 'companY_nm': '顧客名稱', 'comp_address': '顧客地址', 'actgr_nm': '服務據點', 'callt_id': '服務類型', 'out_dt': '出發時間', 'arrival_dt': '抵達時間', 'end_Dt': '結束時間', 'back_dt': '返回時間', 'next_place': '下一站', 'person_id': '負責人員', 'out_day': '服務日期', 'out_dt_secs': '出發時間(秒)', 'back_dt_secs': '返回時間(秒)', 'Daily_PathID': '當日路徑編號', 'Daily_PathOrder': '路徑上服務順序', 'Unique_PathID': '路徑編號', 'GoMove_Dist': '去程移動距離(公里)', 'BackMove_Dist': '回程移動距離(公里)'}, axis=1)  # new method
    loc_PathData_df = loc_PathData_df.rename({'Out_Day': '服務日期', 'Path_Order': '當日服務路徑順序', 'Unique_PathID': '路徑編號', 'PathGo_MoveDist': '去程移動總距離(公里)', 'PathBack_MoveDist': '回程移動總距離(公里)', 'PathTol_MoveDist(km)': '路徑移動總距離(公里)', 'Begin_Time(normal)': '服務開始時間', 'End_Time(normal)': '服務結束時間', 'Begin_Time(secs)': '服務開始時間(秒)', 'End_Time(secs)': '服務結束時間(秒)'}, axis=1)  
    loc_PathData_df = loc_PathData_df.sort_values(['服務日期','當日服務路徑順序'], ascending=[True,True])    
    
    tEnd = time.time()#計時結束
    print ("It cost %f sec" % (tEnd - tStart))#會自動做近位
    
    return df_final_Data.to_excel('C:\\Users\\User\\Desktop\\20191128_NEC_system\\Output_DATA_0_mins\\'+ office_EGnm +'_PathDist_detail.xlsx', encoding='utf-8', index=False), loc_PathData_df.to_excel('C:\\Users\\User\\Desktop\\20191128_NEC_system\\Output_DATA_0_mins\\'+ office_EGnm +'_PathDist_analy.xlsx', encoding='utf-8', index=False), custDist_Data.to_excel(custDist_file , encoding='utf-8')
        

    
#df_final_Data.to_excel( 'loc_PathDist_detail.xlsx' )
#loc_PathData_df.to_excel( 'loc_PathData_analys.xlsx' )
#custDist_Data.to_excel( custDist_file )

