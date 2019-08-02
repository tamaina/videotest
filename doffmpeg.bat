ffmpeg -re -i monorail.mp4 ^
-filter:v:0 "scale=if(gte(iw\,ih)\,min(1280\,iw)\,-2):if(lt(iw\,ih)\,min(1280\,ih)\,-2)" -c:v:0 libvpx-vp9 -b:v:0 1000k -c:a:0 libopus -b:a:0 128k -minrate 500k -maxrate 1500k -threads 1 ^
-filter:v:1 scale=640:-2 -c:v:1 libx264 -b:v:1 400k -c:a:1 aac -b:a:1 128k -threads:v:1 1 ^
-filter:v:2 scale=480:-2 -c:v:2 libvpx-vp9 -b:v:2 150k -c:a:2 libopus -b:a:2 96k -threads:v:2 1 ^
-quality realtime -speed 4 -keyint_min 120 -g 120 ^
-map 0 -map 0 -map 0 -f dash -init_seg_name mono-init-s$RepresentationID$.$ext$ -media_seg_name mono-chunk-s$RepresentationID$-$Number%%05d$.$ext$ -adaptation_sets "id=0,streams=v id=1,streams=a" -use_template 1 -use_timeline 0 mono.mpd 2> error.txt 
