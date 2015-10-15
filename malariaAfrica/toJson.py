
import json

def main():
	outFile = open("AfricaPollys.json","w")

	jsonData = {}
	with open("AfricaPoints.csv") as f:
		for line in f: 
			data = line.split(",")
			dataId = data[0]

			# if points in the polygon already exist then add to the existing array
			if dataId in jsonData:
				oldPolys = jsonData[dataId]['Pollygons']
				newPoint = [data[2],data[3].replace("\r\n","")]
				oldPolys.append(newPoint)
				jsonData[dataId]['Pollygons'] = oldPolys

			#Otherwise be sure to add it to the structure
			else:
				jsonData[dataId] = {'Name': data[1], 'Pollygons':[[data[2],data[3].replace("\r\n","")]]}

	outFile.write(json.dumps(jsonData))








if __name__ == "__main__":
	main()