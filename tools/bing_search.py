def bing_search_and_return_urls(query='error', funny=0, cartoon=0, animated=0, search_type='Image', minsize=150, maxsize=250, testing=True):
    """
    Main function called. Adds some extra parameters to the search (i.e. extra keywords) then filters results according to size
    """
    import urllib
    import urllib2
    import json
    if testing:
        return [ u'http://kidfocused.com/wp-content/uploads/2012/09/grandparents-150x150.jpg',
                 u'http://thumbs.gograph.com/gg58323490.jpg',
                 u'http://www.divorcehq.com/graphics/grandfather.jpg',
                 u'http://www.activity-sheets.com/coloring_page/grandparents-day/grandparents-pics/grandparents-day-coloring-115-sm150.gif',
                 u'http://seniorlifepage.com/assets/images/CommunityLiving/grandparents_raising_grandkids_th(1).jpg',
                 u'http://sr.photos2.fotosearch.com/bthumb/CSP/CSP990/k11129374.jpg',
                 u'http://api.ning.com/files/J2I5RujSHmNxcS4aKnh36oIWIPHKYbSP7B2*71InbBcbJcjcrEES6-4JenfdSfm2VZ8C6j1ltuIV9PIR2MwUKEtKaZzYx3Na/ChildCareBenefitGrandparents.jpg?crop=1%3A1&width=171',
                 u'http://fla.fg-a.com/grandparents/grandparents-dancing.gif',
                 u'http://www.hey-arnold.com/Arnold/StinkysGrandparents.jpg',
                 u'http://www.cust-m-cartoons.com/grandparents3.jpg']
    else:
        q = query
        if funny:
            q += " funny"
        if cartoon:
            q += " cartoon"
        if animated:  # Not in use currently
            q += " animated gif"
        results = bing_search_api(query = query, search_type = search_type, size = 'Small')
        results_filtered = [img['MediaUrl'] for img in results if int(img['Width']) >= minsize if int(img['Width']) <= maxsize]
        return results_filtered

    

def bing_search_api(query='funny cats', search_type='Image', number_results='20', adult=['Strict','Moderate','Off'][0], market='en-GB', size=['Small', 'Medium', 'Large'][0]):
    """
    Calls Bing via API using key. 5000 requests allowed per month.
    """
    import urllib
    import urllib2
    import json
    # See https://datamarket.azure.com/dataset/explore/5ba839f1-12ce-4cce-bf57-a49d98d29a44
    # And http://www.guguncube.com/2771/python-using-the-bing-search-api
    # Search_type: Web, Image, News, Video
    key= '6lmaBalNA7iU8Lf+bmd+ow44eSDrqqavEwkV0n6nvsg'
    query = urllib.quote(query)
    # create credential for authentication
    user_agent = 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; FDM; .NET CLR 2.0.50727; InfoPath.2; .NET CLR 1.1.4322)'
    credentials = (':%s' % key).encode('base64')[:-1]
    auth = 'Basic %s' % credentials
    url = 'https://api.datamarket.azure.com/Data.ashx/Bing/Search/'+search_type+'?Query=%27'+query+'%27&Market=%27'+market+'%27&Adult=%27'+adult+'%27&ImageFilters=%27Size%3A'+size+'%27&$top='+number_results+'&$format=json'
    request = urllib2.Request(url)
    request.add_header('Authorization', auth)
    request.add_header('User-Agent', user_agent)
    request_opener = urllib2.build_opener()
    response = request_opener.open(request) 
    response_data = response.read()
    json_result = json.loads(response_data)
    result_list = json_result['d']['results']
    if False:
        print url
        print result_list
    return result_list
 

