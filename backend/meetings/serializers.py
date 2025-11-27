"""
Serializers for meetings app.
"""
from rest_framework import serializers
from .models import Meeting, MeetingSlot, Location


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location."""
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'description']


class MeetingSlotSerializer(serializers.ModelSerializer):
    """Serializer for MeetingSlot."""
    
    proposed_by_email = serializers.EmailField(source='proposed_by.email', read_only=True)

    class Meta:
        model = MeetingSlot
        fields = [
            'id', 'proposed_by', 'proposed_by_email',
            'start_datetime', 'end_datetime', 'is_selected', 'created_at'
        ]
        read_only_fields = ['id', 'proposed_by', 'is_selected', 'created_at']


class MeetingSerializer(serializers.ModelSerializer):
    """Serializer for Meeting."""
    
    slots = MeetingSlotSerializer(many=True, read_only=True)
    selected_location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.filter(is_active=True),
        source='selected_location',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Meeting
        fields = [
            'id', 'status', 'selected_location', 'location_id',
            'location_notes', 'confirmed_slot', 'slots',
            'gift_exchanged', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'confirmed_slot', 'gift_exchanged', 'created_at', 'updated_at']


class MeetingSlotCreateSerializer(serializers.Serializer):
    """Serializer for creating meeting slots."""
    
    slots = serializers.ListField(
        child=serializers.DictField(
            child=serializers.DateTimeField()
        ),
        min_length=1,
        max_length=3
    )

    def validate_slots(self, value):
        """Validate slot data."""
        validated_slots = []
        for slot_data in value:
            if 'start_datetime' not in slot_data or 'end_datetime' not in slot_data:
                raise serializers.ValidationError('Each slot must have start_datetime and end_datetime.')
            
            start = slot_data['start_datetime']
            end = slot_data['end_datetime']
            
            if start >= end:
                raise serializers.ValidationError('start_datetime must be before end_datetime.')
            
            validated_slots.append({
                'start_datetime': start,
                'end_datetime': end
            })
        
        return validated_slots

