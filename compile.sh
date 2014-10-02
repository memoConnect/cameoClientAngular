#!/bin/bash

buildMode=test
buildPhonegap=false
command="app:deploy"
version="no version"

#handle arguments
for i in "$@" ; do
	case $i in
	    -m=*|--mode=*)
		    buildMode="${i#*=}"
	    ;;
	    -a=*|--apiUrl=*)
		    apiUrl="${i#*=}"
		    echo -e "\e[33m[ CameoClient - setting API Url to ${apiUrl} ]\033[0m"
		    apiUrlArg=--apiUrl=${apiUrl}
		;;
	    -v=*|--version=*)
		    version="${i#*=}"
	    ;;
		--phonegap)
			command=phonegap:to-build-server
		;;
	    *)
	      echo Unknown option: ${i}
	      exit 1
	    ;;
	esac
done

./setup.sh

echo -e "\e[33m[ CameoClient - starting deploy, target: ${target} ]\033[0m"

grunt ${command} --target=${buildMode} --appVersion=${version} ${apiUrlArg}