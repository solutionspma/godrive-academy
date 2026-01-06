#!/bin/bash

states=(
  "AL:Alabama" "AK:Alaska" "AZ:Arizona" "AR:Arkansas" "CO:Colorado"
  "CT:Connecticut" "DE:Delaware" "FL:Florida" "GA:Georgia" "HI:Hawaii"
  "ID:Idaho" "IL:Illinois" "IN:Indiana" "IA:Iowa" "KS:Kansas"
  "KY:Kentucky" "LA:Louisiana" "ME:Maine" "MD:Maryland" "MA:Massachusetts"
  "MI:Michigan" "MN:Minnesota" "MS:Mississippi" "MO:Missouri" "MT:Montana"
  "NE:Nebraska" "NV:Nevada" "NH:New Hampshire" "NJ:New Jersey" "NM:New Mexico"
  "NY:New York" "NC:North Carolina" "ND:North Dakota" "OH:Ohio" "OK:Oklahoma"
  "OR:Oregon" "PA:Pennsylvania" "RI:Rhode Island" "SC:South Carolina" "SD:South Dakota"
  "TN:Tennessee" "UT:Utah" "VT:Vermont" "VA:Virginia" "WA:Washington"
  "WV:West Virginia" "WI:Wisconsin" "WY:Wyoming"
)

for state in "${states[@]}"; do
  code="${state%%:*}"
  name="${state##*:}"
  
  cat > "${code}.json" << EOF
{
  "state": "$name",
  "stateCode": "$code",
  "version": "2024.01",
  "questions": [
    {
      "id": "${code}_q1",
      "question": "What should you do when approaching a yellow traffic light?",
      "options": [
        "Speed up to make it through",
        "Stop if it is safe to do so",
        "Continue at the same speed",
        "Honk to warn other drivers"
      ],
      "answer": 1,
      "explanation": "A yellow light means the signal is about to turn red. You should stop if you can do so safely. Only proceed if you are too close to stop safely."
    },
    {
      "id": "${code}_q2",
      "question": "What is the proper following distance behind another vehicle?",
      "options": [
        "One car length",
        "Two seconds",
        "Three to four seconds",
        "Ten feet"
      ],
      "answer": 2,
      "explanation": "The three to four second rule gives you enough time to react if the vehicle ahead stops suddenly. Increase this distance in bad weather or at higher speeds."
    }
  ]
}
EOF
  echo "Created ${code}.json"
done

echo "✅ All state files created!"
